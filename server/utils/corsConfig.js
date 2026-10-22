/**
 * CORS origin allowlist helpers.
 *
 * Kept separate from index.js so the build/inspection logic can be unit tested
 * without booting the Express server or connecting to MongoDB.
 */

const DEFAULT_ORIGINS = [
  "https://nyaynow.in",
  "https://www.nyaynow.in",
  "https://nyaynow.com",
];

function buildAllowedOrigins(env = process.env) {
  const extra = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [];
  return [
    ...DEFAULT_ORIGINS,
    env.CLIENT_URL,
    ...extra,
    ...(env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://localhost:5173"] : []),
  ].filter(Boolean);
}

function inspectOriginConfig(origins, env = process.env) {
  const warnings = [];
  const isProd = env.NODE_ENV === "production";

  const withoutScheme = origins.filter((o) => !/^https?:\/\//.test(o));
  if (withoutScheme.length) {
    warnings.push(`Origin(s) without an http(s) scheme never match a browser Origin: ${withoutScheme.join(", ")}`);
  }

  const duplicates = [...new Set(origins.filter((o, i) => origins.indexOf(o) !== i))];
  if (duplicates.length) {
    warnings.push(`Duplicate allowed origin(s): ${duplicates.join(", ")}`);
  }

  if (isProd) {
    if (!env.CLIENT_URL && !env.ALLOWED_ORIGINS) {
      warnings.push("NODE_ENV=production but neither CLIENT_URL nor ALLOWED_ORIGINS is set; only built-in defaults apply.");
    }
    const insecure = origins.filter((o) => o.startsWith("http://"));
    if (insecure.length) {
      warnings.push(`Insecure (http://) origin(s) in a production allowlist: ${insecure.join(", ")}`);
    }
    const wildcards = origins.filter((o) => o.includes("*"));
    if (wildcards.length) {
      warnings.push(`Wildcard origin(s) cannot be matched literally and are unsafe in production: ${wildcards.join(", ")}`);
    }
  }

  return warnings;
}

function logOriginConfig(origins, env = process.env, logger = console) {
  logger.log(`[CORS] ${origins.length} allowed origin(s): ${origins.join(", ")}`);
  for (const warning of inspectOriginConfig(origins, env)) {
    logger.warn(`[CORS] ${warning}`);
  }
}

module.exports = { DEFAULT_ORIGINS, buildAllowedOrigins, inspectOriginConfig, logOriginConfig };

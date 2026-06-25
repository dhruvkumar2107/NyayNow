const jwt = require("jsonwebtoken");

/* ======= JWT COOKIE CONFIGURATION ======= */
const ACCESS_TTL  = "15m";
const REFRESH_TTL = "7d";
const COOKIE_BASE = { httpOnly: true, secure: true, sameSite: "none" };

function issueTokens(res, user) {
  const payload = { id: user._id, role: user.role, plan: user.plan };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(
    { id: user._id, type: "refresh", version: user.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_TTL }
  );

  res.cookie("token",        accessToken,  { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/api/auth/refresh" });

  return accessToken;
}

/* ======= LOGIN BRUTE-FORCE PROTECTION ======= */
// In-memory per-email tracking; resets automatically after lockout window.
const loginAttempts = new Map();
const MAX_LOGIN_FAILURES = 10;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

function isLoginLocked(email) {
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (Date.now() > entry.lockUntil) { loginAttempts.delete(email); return false; }
  return entry.count >= MAX_LOGIN_FAILURES;
}

function recordLoginFailure(email) {
  const entry = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_LOGIN_FAILURES) entry.lockUntil = Date.now() + LOGIN_LOCK_MS;
  loginAttempts.set(email, entry);
}

function resetLoginAttempts(email) {
  loginAttempts.delete(email);
}

module.exports = { issueTokens, isLoginLocked, recordLoginFailure, resetLoginAttempts };

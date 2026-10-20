const { DEFAULT_ORIGINS, buildAllowedOrigins, inspectOriginConfig } = require('../utils/corsConfig');

describe('CORS origin configuration', () => {
  test('always includes the built-in production defaults', () => {
    const origins = buildAllowedOrigins({ NODE_ENV: 'production' });
    for (const origin of DEFAULT_ORIGINS) {
      expect(origins).toContain(origin);
    }
  });

  test('appends CLIENT_URL and comma-separated ALLOWED_ORIGINS, trimmed', () => {
    const origins = buildAllowedOrigins({
      NODE_ENV: 'production',
      CLIENT_URL: 'https://staging.nyaynow.in',
      ALLOWED_ORIGINS: 'https://a.example.com, https://b.example.com ',
    });
    expect(origins).toContain('https://staging.nyaynow.in');
    expect(origins).toContain('https://a.example.com');
    expect(origins).toContain('https://b.example.com');
  });

  test('includes localhost dev origins outside production only', () => {
    expect(buildAllowedOrigins({ NODE_ENV: 'development' })).toContain('http://localhost:3000');
    expect(buildAllowedOrigins({ NODE_ENV: 'production' })).not.toContain('http://localhost:3000');
  });

  test('drops empty/falsy entries', () => {
    const origins = buildAllowedOrigins({ NODE_ENV: 'production', CLIENT_URL: '', ALLOWED_ORIGINS: '' });
    expect(origins.every(Boolean)).toBe(true);
  });

  test('a clean production config produces no warnings', () => {
    const env = {
      NODE_ENV: 'production',
      CLIENT_URL: 'https://app.nyaynow.in',
    };
    const origins = buildAllowedOrigins(env);
    expect(inspectOriginConfig(origins, env)).toEqual([]);
  });

  test('warns about insecure http origins in production', () => {
    const warnings = inspectOriginConfig(
      ['https://nyaynow.in', 'http://insecure.example.com'],
      { NODE_ENV: 'production', CLIENT_URL: 'https://nyaynow.in' }
    );
    expect(warnings.some((w) => /Insecure \(http:\/\//.test(w))).toBe(true);
  });

  test('warns about wildcard origins in production', () => {
    const warnings = inspectOriginConfig(
      ['https://nyaynow.in', 'https://*.vercel.app'],
      { NODE_ENV: 'production', CLIENT_URL: 'https://nyaynow.in' }
    );
    expect(warnings.some((w) => /Wildcard/.test(w))).toBe(true);
  });

  test('warns when neither CLIENT_URL nor ALLOWED_ORIGINS is set in production', () => {
    const warnings = inspectOriginConfig(['https://nyaynow.in'], { NODE_ENV: 'production' });
    expect(warnings.some((w) => /neither CLIENT_URL nor ALLOWED_ORIGINS/.test(w))).toBe(true);
  });

  test('warns about duplicates and scheme-less entries', () => {
    const warnings = inspectOriginConfig(
      ['https://nyaynow.in', 'https://nyaynow.in', 'nyaynow.in'],
      { NODE_ENV: 'production', CLIENT_URL: 'https://nyaynow.in' }
    );
    expect(warnings.some((w) => /Duplicate/.test(w))).toBe(true);
    expect(warnings.some((w) => /without an http\(s\) scheme/.test(w))).toBe(true);
  });
});

/**
 * Lightweight schema-based request body validator.
 * No external dependencies — works with pure Node.js.
 *
 * Usage:
 *   const { validate, rules } = require('./validate');
 *   router.post('/login', validate({ email: rules.email, password: rules.string(8) }), handler);
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECTID_RE = /^[a-f\d]{24}$/i;

/**
 * Built-in rule factories.
 */
const rules = {
  string:   (minLen = 1, maxLen = 5000) => ({ type: 'string', minLen, maxLen }),
  email:    ()                          => ({ type: 'string', minLen: 5, maxLen: 254, pattern: EMAIL_RE, patternMsg: 'must be a valid email address' }),
  objectId: ()                          => ({ type: 'string', pattern: OBJECTID_RE, patternMsg: 'must be a valid ID' }),
  enum:     (...values)                 => ({ type: 'string', enum: values }),
  integer:  (min, max)                  => ({ type: 'number', min, max }),
  boolean:  ()                          => ({ type: 'boolean' }),
};

/**
 * @param {Record<string, {type, required?, minLen?, maxLen?, min?, max?, enum?, pattern?, patternMsg?}>} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = [];

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const missing = value === undefined || value === null || value === '';

      if (rule.required !== false && missing) {
        errors.push(`${field} is required`);
        continue;
      }
      if (missing) continue; // optional field not provided — skip further checks

      // Type check
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
        continue;
      }
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
        continue;
      }

      if (typeof value === 'string') {
        if (rule.minLen !== undefined && value.length < rule.minLen)
          errors.push(`${field} must be at least ${rule.minLen} characters`);
        if (rule.maxLen !== undefined && value.length > rule.maxLen)
          errors.push(`${field} must be at most ${rule.maxLen} characters`);
        if (rule.pattern && !rule.pattern.test(value))
          errors.push(`${field} ${rule.patternMsg || 'has an invalid format'}`);
        if (rule.enum && !rule.enum.includes(value))
          errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }

      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min)
          errors.push(`${field} must be at least ${rule.min}`);
        if (rule.max !== undefined && value > rule.max)
          errors.push(`${field} must be at most ${rule.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }
    next();
  };
}

module.exports = { validate, rules };

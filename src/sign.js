const crypto = require('crypto');

function buildSignStr(params, excludeKeys = ['signature', 'sign']) {
  const set = Array.isArray(excludeKeys) ? new Set(excludeKeys) : new Set([excludeKeys]);
  const keys = Object.keys(params)
    .filter((k) => params[k] != null && params[k] !== '' && !set.has(k))
    .sort();
  return keys.map((k) => `${k}=${params[k]}`).join('&');
}

function sign(params, token) {
  const str = buildSignStr(params) + token;
  return crypto.createHash('md5').update(str).digest('hex').toLowerCase();
}

function verify(params, token) {
  const received = (params.signature || params.sign || '').toLowerCase();
  const expected = sign(params, token);
  return received && received === expected;
}

module.exports = { buildSignStr, sign, verify };

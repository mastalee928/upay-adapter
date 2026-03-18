const crypto = require('crypto');

function buildSignStr(params, excludeKey = 'signature') {
  const keys = Object.keys(params)
    .filter((k) => params[k] != null && params[k] !== '' && k !== excludeKey)
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

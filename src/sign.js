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

/** BEpusdt 创建订单时只对这些参数签名，独角数卡 NEXT 可能不签 guest、order_no 等 */
const CREATE_ORDER_SIGN_KEYS = ['address', 'amount', 'fiat', 'name', 'notify_url', 'order_id', 'redirect_url', 'return_url', 'trade_type', 'timeout', 'rate'];

function buildSignStrWhitelist(params, allowedKeys) {
  const sorted = allowedKeys
    .filter((k) => params[k] != null && params[k] !== '')
    .sort();
  return sorted.map((k) => `${k}=${params[k]}`).join('&');
}

function verifyCreateOrder(params, token) {
  const received = (params.signature || params.sign || '').toLowerCase();
  const str = buildSignStrWhitelist(params, CREATE_ORDER_SIGN_KEYS);
  const expected = crypto.createHash('md5').update(str + token).digest('hex').toLowerCase();
  return received && received === expected;
}

/** BEpusdt 回调验签参数字段（按字母序），独角数卡用 auth_token 验签 */
const CALLBACK_SIGN_KEYS = ['actual_amount', 'amount', 'block_transaction_id', 'order_id', 'status', 'token', 'trade_id'];

function signCallbackForDujiaoka(params, token) {
  const str = buildSignStrWhitelist(params, CALLBACK_SIGN_KEYS);
  return crypto.createHash('md5').update(str + token).digest('hex').toLowerCase();
}

module.exports = {
  buildSignStr,
  buildSignStrWhitelist,
  sign,
  verify,
  verifyCreateOrder,
  signCallbackForDujiaoka,
  CREATE_ORDER_SIGN_KEYS,
};

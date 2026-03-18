const BASE = process.env.UPAY_BASE_URL || '';
const TOKEN = process.env.UPAY_API_TOKEN || '';
const { sign } = require('./sign');

async function createOrder(payload) {
  const url = `${BASE.replace(/\/$/, '')}/api/create_order`;
  if (!TOKEN) {
    throw new Error('UPAY_API_TOKEN 未配置');
  }
  const params = { ...payload };
  params.signature = sign(params, TOKEN);
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (e) {
    throw new Error(`UPAY 请求失败: ${e.message}`);
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`UPAY 返回非 JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.msg || data?.error || `HTTP ${res.status}`);
  }
  return data;
}

module.exports = { createOrder };

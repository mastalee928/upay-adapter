const BASE = process.env.UPAY_BASE_URL || '';

async function createOrder(payload) {
  const url = `${BASE.replace(/\/$/, '')}/api/create_order`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    throw new Error(data?.message || data?.msg || `HTTP ${res.status}`);
  }
  return data;
}

module.exports = { createOrder };

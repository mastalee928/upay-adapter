require('dotenv').config();
const express = require('express');
const { verifyCreateOrder, buildSignStrWhitelist } = require('./sign');
const { CREATE_ORDER_SIGN_KEYS } = require('./sign');
const store = require('./store');
const upayClient = require('./upayClient');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = Number(process.env.PORT) || 3100;
const ADAPTER_PUBLIC_URL = (process.env.ADAPTER_PUBLIC_URL || '').replace(/\/$/, '');
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || process.env.UPAY_API_TOKEN || '';
const TOKEN = GATEWAY_TOKEN;

function requireAdapterUrl(req, res, next) {
  if (!ADAPTER_PUBLIC_URL) {
    res.status(503).json({ ok: false, message: 'ADAPTER_PUBLIC_URL 未配置' });
    return;
  }
  next();
}

function mapTradeTypeToUpay(tt) {
  if (!tt || typeof tt !== 'string') return 'TRC20-USDT';
  const s = tt.toLowerCase();
  if (s.includes('trc20') || s === 'usdt.trc20') return 'TRC20-USDT';
  if (s.includes('erc20') || s === 'usdt.erc20') return 'ERC20-USDT';
  return tt;
}

async function handleCreateOrder(body, res) {
  console.log('[create_order] 收到请求', body?.order_id || body?.out_trade_no || '');
  if (!verifyCreateOrder(body, TOKEN)) {
    const recv = (body.signature || body.sign || '').toLowerCase();
    const signStr = buildSignStrWhitelist(body, CREATE_ORDER_SIGN_KEYS);
    const crypto = require('crypto');
    const expect = crypto.createHash('md5').update(signStr + TOKEN).digest('hex').toLowerCase();
    console.log('[create_order] 签名错误', 'received(前8):', recv.slice(0, 8), 'expected(前8):', expect.slice(0, 8));
    console.log('[create_order] 我方参与签名的参数字符串(仅BEpusdt字段,无token):', signStr);
    res.status(400).json({ ok: false, message: '签名错误' });
    return null;
  }
  const order_id = body.order_id ?? body.out_trade_no;
  const notify_url = body.notify_url;
  const redirect_url = body.redirect_url ?? body.return_url;
  if (!order_id || !notify_url) {
    res.status(400).json({ ok: false, message: '缺少 order_id 或 notify_url' });
    return null;
  }
  const amount = body.amount ?? body.total_amount;
  const trade_type = mapTradeTypeToUpay(body.trade_type) || 'TRC20-USDT';
  if (!amount) {
    res.status(400).json({ ok: false, message: '缺少 amount' });
    return null;
  }
  const orderIdStr = String(order_id);
  // UPAY Pro 文档：请求字段为 type/order_id/amount/notify_url/redirect_url，redirect_url 必填且为有效 URL
  const payload = {
    type: trade_type,
    order_id: orderIdStr,
    amount: Number(amount),
    notify_url: `${ADAPTER_PUBLIC_URL}/callback/upay`,
    redirect_url: redirect_url || `${ADAPTER_PUBLIC_URL}/return`,
  };
  const result = await upayClient.createOrder(payload);
  const trade_id = result?.data?.trade_id ?? result?.trade_id ?? result?.data?.order_id;
  if (trade_id != null) {
    store.set(order_id, trade_id, { notify_url, redirect_url });
  }
  const payUrl = result?.data?.pay_url ?? result?.pay_url ?? result?.data?.payment_url;
  console.log('[create_order] 成功', orderIdStr, payUrl ? '有支付链接' : '无支付链接');
  return { order_id: orderIdStr, trade_id, amount: Number(amount), payUrl };
}

app.post('/api/create_order', requireAdapterUrl, async (req, res) => {
  try {
    const data = await handleCreateOrder(req.body || {}, res);
    if (data == null) return;
    return res.json({
      ok: true,
      data: {
        pay_url: data.payUrl,
        payment_url: data.payUrl,
        trade_id: data.trade_id,
      },
    });
  } catch (e) {
    console.error('[create_order] 失败', e.message);
    return res.status(500).json({ ok: false, message: e.message || '创建订单失败' });
  }
});

// BEpusdt 标准路径，独角数卡 NEXT 会请求此地址
app.post('/api/v1/order/create-transaction', requireAdapterUrl, async (req, res) => {
  try {
    const data = await handleCreateOrder(req.body || {}, res);
    if (data == null) return;
    return res.json({
      status_code: 200,
      message: 'success',
      data: {
        trade_id: data.trade_id,
        order_id: data.order_id,
        amount: String(data.amount),
        actual_amount: String(data.amount),
        status: 1,
        payment_url: data.payUrl,
      },
      request_id: '',
    });
  } catch (e) {
    console.error('[create_order] 失败', e.message);
    return res.status(500).json({
      status_code: 500,
      message: e.message || '创建订单失败',
      data: null,
      request_id: '',
    });
  }
});

app.get('/callback/upay', (req, res) => handleCallback(req.query, res));
app.post('/callback/upay', (req, res) => handleCallback(req.body || {}, res));

async function handleCallback(params, res) {
  const status = Number(params.status);
  if (status !== 2) {
    return res.send('success');
  }
  const order_id = params.order_id ?? params.out_trade_no;
  const trade_id = params.trade_id;
  const key = order_id ?? trade_id;
  const info = key != null ? store.get(key) : null;
  if (!info?.notify_url) {
    return res.send('success');
  }
  try {
    const forwardRes = await fetch(info.notify_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    console.log('forward callback', info.notify_url, forwardRes.status);
  } catch (e) {
    console.error('forward callback error', e);
  }
  return res.send('success');
}

app.listen(PORT, () => {
  console.log(`upay-adapter listening on ${PORT}`);
});

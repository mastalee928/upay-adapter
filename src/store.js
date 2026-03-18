const store = new Map();

function set(orderId, tradeId, data) {
  const key = orderId ?? tradeId;
  if (key != null) store.set(String(key), data);
}

function get(orderIdOrTradeId) {
  return store.get(String(orderIdOrTradeId));
}

module.exports = { set, get };

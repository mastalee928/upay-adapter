# 代码审视

## 结构

- `src/app.js`：入口，创建订单 + 回调转发
- `src/sign.js`：BEpusdt/UPAY 签名与验签
- `src/upayClient.js`：调 UPAY 创建订单
- `src/store.js`：内存存储 order_id/trade_id → notify_url

## 结论：整体可接受

- **流程**：独角数卡 → 创建订单 → 存 store → UPAY 回调 → 查 store → 转发独角数卡，逻辑清晰。
- **签名**：与 BEpusdt/UPAY 文档一致（排序、key=value&…、末尾拼 Token、MD5 小写）。
- **回调**：仅 status=2 转发、JSON 转发、返回 success，符合独角数卡 epusdt 实现。
- **环境**：ADAPTER_PUBLIC_URL 未配置时直接 503，避免静默回调失败。

## 可改进点（非必须）

1. **upayClient.js**：UPAY 返回非 JSON（如 502 页面）时 `res.json()` 可能抛错，可在外层 `try/catch` 后包装为明确错误信息。
2. **store**：当前内存存储，单实例无问题；多副本或重启会丢未回调映射，生产可改为 Redis。
3. **日志**：关键路径已有；如需审计可对回调请求体做脱敏日志。

## 依赖

- 仅 express、dotenv，无敏感依赖；Node >= 18。

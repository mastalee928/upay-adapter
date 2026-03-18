# Docker 部署

在**项目根目录**执行：

```bash
# 从示例创建 .env（Windows PowerShell: Copy-Item .env.example .env）
cp .env.example .env
# 编辑 .env，填写 UPAY_BASE_URL、UPAY_API_TOKEN、ADAPTER_PUBLIC_URL

docker compose -f docker/docker-compose.yml up -d --build
```

容器内监听 3100，宿主机端口由 `.env` 中 `PORT` 决定（默认 3100）。需保证 `ADAPTER_PUBLIC_URL` 的域名能解析到本机并反代到该端口。

- `CODE_REVIEW.md`：代码审视结论。
- 未使用 Docker 时，可在根目录执行 `npm install` 后 `npm start` 或 `node src/app.js` 直接运行。

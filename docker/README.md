# Docker 部署

**环境变量文件**：`.env` 放在**项目根目录**（与 `docker` 文件夹同级），不在 `docker/` 内。`docker-compose` 通过 `env_file: ../.env` 读取。

在**项目根目录**执行（Linux 服务器上）：

```bash
cp .env.example .env
# 编辑 .env，填写 UPAY_BASE_URL、UPAY_API_TOKEN、ADAPTER_PUBLIC_URL

docker compose -f docker/docker-compose.yml up -d --build
```

容器内监听 3100，宿主机端口由 `.env` 中 `PORT` 决定（默认 3100）。需保证 `ADAPTER_PUBLIC_URL` 的域名能解析到本机并反代到该端口。

**更新**：在项目根目录执行 `git pull && docker compose -f docker/docker-compose.yml up -d --build`。

- `CODE_REVIEW.md`：代码审视结论。

# upay-adapter

独角数卡支持 UPAY 支付的通讯适配器。将独角数卡（Next）的支付请求转发到 UPAY 创建订单，并在 UPAY 回调时把支付结果通知回独角数卡。

**仅提供 Docker 部署。**

## 快速开始

### 1. 配置环境变量

在项目根目录：

```bash
# 从示例复制（Windows: Copy-Item .env.example .env）
cp .env.example .env
```

编辑 `.env`，必填项：

| 变量 | 说明 |
|------|------|
| `UPAY_BASE_URL` | UPAY 接口地址，如 `https://your-upay.com` |
| `UPAY_API_TOKEN` | UPAY API Token |
| `ADAPTER_PUBLIC_URL` | 本适配器对外访问地址（必填），如 `https://adapter.example.com`，用于创建订单与接收 UPAY 回调 |

可选：`PORT` 默认 3100。

### 2. Docker 启动

在项目根目录执行：

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

容器内监听 3100，宿主机端口由 `.env` 中 `PORT` 决定。需保证 `ADAPTER_PUBLIC_URL` 的域名能解析到本机并反代到该端口。

详见 [docker/README.md](docker/README.md)。

### 3. 独角数卡配置

- 支付网关：本适配器对外的创建订单地址，例如 `https://adapter.example.com/api/create_order`
- 支付结果通知地址（回调）：填写独角数卡提供的 callback API 地址；适配器在 UPAY 支付成功后向该地址转发 JSON 回调（仅 `status=2` 时转发）

## 项目结构

- `src/` — 适配器源码（入口、签名、UPAY 调用、内存存储）
- `docker/` — Dockerfile、docker-compose 及部署说明

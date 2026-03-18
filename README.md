# upay-adapter

独角数卡支持 UPAY 支付的通讯适配器。将独角数卡（Next）的支付请求转发到 UPAY 创建订单，并在 UPAY 回调时把支付结果通知回独角数卡。

**仅提供 Docker 部署，在 Linux 服务器上运行。**

---

## 一键命令部署（推荐）

```bash
git clone https://github.com/mastalee928/upay-adapter.git && cd upay-adapter && cp .env.example .env
```

编辑 `.env`，填写 `UPAY_BASE_URL`、`UPAY_API_TOKEN`、`ADAPTER_PUBLIC_URL` 后，在项目根目录执行：

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

启动后，需将 `ADAPTER_PUBLIC_URL` 的域名解析到本机并反代到 3100 端口（或你在 `.env` 中设置的 `PORT`）。

---

## Docker Compose 部署

**克隆项目**

```bash
git clone https://github.com/mastalee928/upay-adapter.git
cd upay-adapter
```

**配置环境变量**

```bash
cp .env.example .env
# 编辑 .env，填写 UPAY_BASE_URL、UPAY_API_TOKEN、ADAPTER_PUBLIC_URL（必填），PORT 可选，默认 3100
```

**启动（默认端口 3100）**

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

**自定义端口**

```bash
PORT=3000 docker compose -f docker/docker-compose.yml up -d --build
```

**查看状态 / 日志**

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f
```

**停止**

```bash
docker compose -f docker/docker-compose.yml down
```

**更新（拉取最新代码并重新构建启动）**

```bash
cd upay-adapter
git pull
docker compose -f docker/docker-compose.yml up -d --build
```

或一行命令：

```bash
git pull && docker compose -f docker/docker-compose.yml up -d --build
```

（需在项目根目录 `upay-adapter` 下执行。）

---

## 环境变量说明

`.env` 放在项目根目录（与 `docker` 文件夹同级）。

| 变量 | 说明 |
|------|------|
| `UPAY_BASE_URL` | UPAY 接口地址，如 `https://your-upay.com` |
| `UPAY_API_TOKEN` | UPAY API Token |
| `ADAPTER_PUBLIC_URL` | 本适配器对外访问地址（必填），如 `https://adapter.example.com` |
| `PORT` | 宿主机暴露端口，默认 3100 |

---

## 独角数卡配置

- **支付网关**：本适配器对外的创建订单地址，如 `https://adapter.example.com/api/create_order`
- **支付结果通知地址（回调）**：填写独角数卡提供的 callback API 地址；适配器在 UPAY 支付成功（status=2）后向该地址转发 JSON 回调

---

## 项目结构

- `src/` — 适配器源码（入口、签名、UPAY 调用、内存存储）
- `docker/` — Dockerfile、docker-compose，详见 [docker/README.md](docker/README.md)

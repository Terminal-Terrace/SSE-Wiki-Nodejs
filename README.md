# 终端露台Nodejs大仓

预计apps里使用koa框架

## Proto 同步

使用 `@sse-wiki/pb-compiler` (cpb) 工具从 GitHub 同步 proto 文件并生成 TypeScript 客户端代码。

### 首次配置

```bash
# 1. 安装 cpb 工具
cd packages/pb-compiler
pnpm install && pnpm build && pnpm link --global

# 2. 配置 GitHub 访问
cpb login <your-github-token>
cpb config --owner Terminal-Terrace --repo SSE-WIKI-Proto

# 3. 验证配置
cpb config --show
```

### 同步 Proto 文件

```bash
cd apps/auth-service
cpb sync --branch main
cpb generate
```

## 故障排查

- **JWT 验签失败 / 总是提示未登录**：确保 `apps/auth-service/.env` 中的 `JWT_SECRET` 与 Go auth-service 使用的密钥完全一致，并且不要添加引号（写成 `JWT_SECRET=xxx`）。更新后需要重启 Go/Node 服务并重新登录生成新 token。
- **Node 请求本地 gRPC 连不上**：macOS 终端如果配置了 `http_proxy/https_proxy/all_proxy`，@grpc/grpc-js 会把 `localhost:50051/50052` 也走代理，导致连接失败。启动 Node Gateway 前可执行 `unset http_proxy https_proxy all_proxy` 或设置 `no_proxy=localhost,127.0.0.1`。

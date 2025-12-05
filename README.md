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

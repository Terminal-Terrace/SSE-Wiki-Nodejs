# 终端露台Nodejs大仓

预计apps里使用koa框架

## TODO

## 环境准备

需要准备 MongoDB + Redis + OSS，注意有两个 **.env.example**, 在各自的app下面

**MongoDB配置**

1. 通过 docker-desktop

```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

2. 直接安装MongoDB

```bash
brew install mongodb-community  # macOS
待补充windows
```

**Redis配置**

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:latest

# 或本地安装
brew install redis && brew services start redis  # macOS
待补充windows
```

**OSS配置**

群里发了id和key，直接配置即可

## 项目启动

```bash
pnpm install  # 安装依赖
pnpm build    # 构建所有 packages
pnpm dev      # 启动开发服务
```

1. auth-service @3002
   因为不想多开一个端口，当前 sse-wiki 和 auth-service 部分都在这里面，后续调整

2. file-service @3003
   通用的文件上传服务，使用阿里云OSS

## 开发示例

### 场景：Go 后端新增了 `GetArticleStats` 方法

#### Step 1: 同步 Proto 文件

```bash
cd apps/auth-service

# 从 GitHub 拉取最新 proto
cpb sync --branch master # 或其他你使用的分支

# 重新生成 TypeScript 类型
cpb generate
```

生成的文件：

- `protobuf/proto/article_service/article_service.proto` - 原始 proto
- `protobuf/types/article_service.d.ts` - TypeScript 类型定义

#### Step 2: 更新 gRPC Client 层

```typescript
// service/wiki-grpc-client.ts
export class ArticleServiceClient {
  // ... 已有方法

  // 新增方法
  async GetArticleStats(req: ArticleServiceTypes.GetArticleStatsRequest): Promise<ArticleServiceTypes.GetArticleStatsResponse> {
    return this.rpcClient.call<ArticleServiceTypes.GetArticleStatsRequest, ArticleServiceTypes.GetArticleStatsResponse>('GetArticleStats', req)
  }
}
```

#### Step 3: 更新 Service 层

```typescript
// service/article/index.ts
export const articleService = {
  // ... 已有方法

  async getArticleStats(articleId: number): Promise<GetArticleStatsResponse> {
    const req: GetArticleStatsRequest = { article_id: articleId }
    return getArticleClient().GetArticleStats(req)
  },
}
```

#### Step 4: 更新 Controller 层

```typescript
// controller/article/index.ts
export const articleController = {
  // ... 已有方法

  async getArticleStats(ctx: Context) {
    const { id } = ctx.params
    const articleId = Number(id)

    if (!articleId || Number.isNaN(articleId)) {
      return error(ctx, 1, '无效的文章 ID')
    }

    try {
      const response = await articleService.getArticleStats(articleId)
      success(ctx, response.stats)
    }
    catch (err: any) {
      error(ctx, 0, err.details || err.message || '获取统计失败')
    }
  },
}
```

#### Step 5: 更新 Router 层

```typescript
// router/index.ts
articleRouter.get('/:id/stats', articleController.getArticleStats)
```

| 层级        | 文件位置                   | 职责                                   |
| ----------- | -------------------------- | -------------------------------------- |
| Router      | `router/index.ts`          | 定义 HTTP 路由，绑定 Controller        |
| Controller  | `controller/*/index.ts`    | 参数校验、调用 Service、格式化响应     |
| Service     | `service/*/index.ts`       | 封装业务逻辑、组装 gRPC 请求参数       |
| gRPC Client | `service/*-grpc-client.ts` | 管理 gRPC 连接、提供类型安全的调用方法 |
| Protobuf    | `protobuf/`                | 类型定义和 proto 文件（自动生成）      |

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
cpb sync --branch master
cpb generate
```

### pb.config.json 配置

```json
{
  "services": [
    "auth_service",
    "article_service",
    "module_service",
    "review_service",
    "discussion_service"
  ],
  "serverAddress": "localhost:50051"
}
```

## 目录结构

```
SSE-Wiki-Nodejs/
├── apps/
│   ├── auth-service/          # BFF 网关服务
│   │   ├── controller/        # 控制器层
│   │   ├── service/           # 服务层 + gRPC Client
│   │   ├── router/            # 路由定义
│   │   ├── middleware/        # 中间件（JWT 验证等）
│   │   ├── protobuf/          # Proto 文件和生成的类型
│   │   └── pb.config.json     # Proto 同步配置
│   ├── file-service/          # 文件上传服务
│   └── template/              # 服务模板
├── packages/
│   ├── pb-compiler/           # Proto 编译 CLI 工具
│   ├── rpc-client/            # gRPC 客户端运行时
│   ├── response/              # 统一响应格式
│   ├── error/                 # 错误处理
│   ├── logger/                # 日志工具
│   └── context/               # Koa Context 扩展
└── package.json
```

## 注意事项

- 确保 `.env` 中的 `JWT_SECRET` 与 后端，并且不要添加引号（写成 `JWT_SECRET=xxx`）
- 如果 `grpc` 连不上，排查终端是否配置了终端代理，因为 @grpc/grpc-js 会把 `localhost:50051/50052` 也走代理，导致连接失败。可以启动前执行`unset http_proxy https_proxy all_proxy` 取消代理。

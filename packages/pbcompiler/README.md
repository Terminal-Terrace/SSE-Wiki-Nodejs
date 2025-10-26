# @sse-wiki/pb-compiler

Protocol Buffer 编译器 CLI 工具，用于从 `.proto` 文件生成类型安全的 TypeScript 客户端代码。

## 功能特性

- 从 `.proto` 文件生成 TypeScript 类型定义和 gRPC 客户端
- 支持从 GitHub 仓库自动下载 proto 文件
- 支持本地 proto 文件
- 类型安全的 RPC 调用接口
- 简洁的 CLI 命令

## 安装

在该目录下执行

```bash
pnpm i # 安装依赖
pnpm build # 构建
pnpm link # 链接到全局
```

## 快速开始

### 1. 初始化配置

```bash
cpb init
```

这将在当前目录创建 `pb.config.json` 配置文件：

```json
{
  "services": [],
  "serverAddress": "localhost:50051" // 网关地址，目前后端还没有实现
}
```

### 2. 配置 GitHub 访问（可选）

如果需要从 GitHub 仓库下载 proto 文件：

```bash
# 配置 GitHub Token
cpb login <your-github-token>

# 配置仓库信息
cpb config --owner <owner> --repo <repo> --proto-dir <path>

# 查看当前配置
cpb config --show
```

### 3. 添加服务

```bash
cpb add user
```

这会将服务添加到 `pb.config.json` 的 `services` 数组中。

### 4. 生成客户端代码

```bash
cpb generate
```

生成的文件将保存在 `./generated/` 目录下：

```
generated/
├── user.proto           # Proto 文件（如果从远程下载）
├── user-types.ts        # TypeScript 类型定义
└── user-service.ts      # gRPC 客户端类
```

## CLI 命令

### `cpb init`

初始化 `pb.config.json` 配置文件。

```bash
cpb init
```

### `cpb generate`

生成所有服务的客户端代码。

```bash
cpb generate

# 使用自定义配置文件
cpb generate -c ./custom-config.json
```

### `cpb add <service>`

添加新服务到配置文件。

```bash
cpb add user
cpb add order -c ./custom-config.json
```

### `cpb sync`

从 GitHub 下载/同步所有 proto 文件（需要先配置 GitHub 访问）。

```bash
cpb sync
cpb sync -c ./custom-config.json
```

### `cpb login <token>`

配置 GitHub Personal Access Token。

```bash
cpb login ghp_xxxxxxxxxxxx
```

生成 Token：前往 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

### `cpb config`

配置 GitHub 仓库信息。

```bash
# 设置仓库信息
cpb config --owner myorg --repo protos --proto-dir services

# 查看当前配置
cpb config --show
```

## 配置文件

`pb.config.json` 示例：

```json
{
  "services": ["user", "order", "product"],
  "serverAddress": "api.example.com:50051"
}
```

### 字段说明

- `services`: 服务名称数组，每个服务对应一个 proto 文件
- `serverAddress`: gRPC 服务器地址（可在客户端实例化时覆盖）

### 约定

- 服务名称（如 `user`）→ proto 文件：`generated/user.proto`
- 服务名称 → 包名：小写服务名
- 服务名称 → 类名：PascalCase + "Service"（如 `UserService`）

## 使用生成的客户端

```typescript
import { UserService } from './generated/user-service'

// 使用默认配置（pb.config.json 中的 serverAddress）
const client = new UserService()

// 或覆盖服务器地址
const client = new UserService({ serverAddress: 'localhost:50051' })

// 调用 RPC 方法
const response = await client.getUser({ userId: '123' })
console.log(response)

// 关闭连接
client.close()
```

## 类型映射

Proto 类型到 TypeScript 类型的映射：

| Proto 类型 | TypeScript 类型 |
|-----------|----------------|
| `int32`, `uint32`, `sint32`, `fixed32`, `sfixed32` | `number` |
| `int64`, `uint64`, `sint64`, `fixed64`, `sfixed64` | `string` |
| `float`, `double` | `number` |
| `bool` | `boolean` |
| `string` | `string` |
| `bytes` | `Uint8Array` |
| `enum` | `enum` |
| `message` | `interface` |
| `repeated` | `Array<T>` |

注：64 位整数映射为 `string` 以避免 JavaScript 精度损失。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm dev

# 构建
pnpm build

# 本地测试
pnpm build && node dist/cli.js init
```

## 项目结构

```
src/
├── cli.ts           # CLI 入口和命令定义
├── config.ts        # 配置文件管理
├── auth-config.ts   # GitHub 认证配置
├── translate.ts     # Proto 到 TypeScript 转换
├── template.ts      # 代码生成模板
└── downloader.ts    # GitHub proto 文件下载
```

## 依赖

- `commander`: CLI 框架
- `chalk`: 终端着色
- `@sse-wiki/rpc-client`: gRPC 客户端运行时（peer dependency）

## 已知限制

- 假设每个 proto 文件定义一个服务
- 使用正则表达式解析 proto（不支持所有 protobuf 语法）
- Proto package 名称必须与服务名称匹配（小写）

## License

ISC

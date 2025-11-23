# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **SSE-Wiki-Nodejs** monorepo, part of the SSE-Wiki (终端露台) project. It contains TypeScript/Node.js packages and Koa applications managed with pnpm workspaces.

**Package Manager**: pnpm@10.19.0
**Structure**: Monorepo with `packages/` (shared utilities) and `apps/` (Koa applications)

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages (excludes apps)
pnpm build

# Build apps only
pnpm build:apps

# Build everything (packages + apps)
pnpm build:all

# Development mode (all packages in parallel watch mode)
pnpm dev

# Lint and auto-fix
pnpm lint

# Commit with commitizen (conventional commits enforced)
pnpm cz
```

### Working with Individual Packages

```bash
# Run command in specific package
pnpm --filter @sse-wiki/logger build
pnpm --filter @sse-wiki/app-template dev

# Add dependency to specific package
pnpm --filter @sse-wiki/logger add lodash
```

### pb-compiler CLI

The `@sse-wiki/pb-compiler` package provides a `cpb` binary for generating TypeScript clients from Protocol Buffers:

```bash
cd packages/pb-compiler
pnpm build && pnpm link    # Install CLI globally

# Usage
cpb init                   # Create pb.config.json
cpb add <service>          # Add service to config
cpb generate               # Generate TypeScript clients
cpb sync                   # Sync proto files (not yet implemented)
```

## Architecture

### Monorepo Structure

- **packages/** - Shared TypeScript libraries (publishable to npm)
  - `logger` - Logging utilities with Koa middleware
  - `error` - Error handling with custom LogicError types
  - `response` - Response middleware adding `ctx.success()` helper
  - `context` - AsyncLocalStorage-based context propagation
  - `rpc-client` - gRPC client runtime wrapper
  - `pb-compiler` - CLI tool for generating gRPC clients from .proto files
  - `template` - Package development template

- **apps/** - Koa applications (not published)
  - `template` - Template Koa app demonstrating architecture patterns

### Koa Application Architecture

Apps follow a layered architecture pattern:

1. **Entry Point** (`index.ts`):

   ```
   Middleware chain order (IMPORTANT):
   1. loggerMiddleware      - Adds ctx.logger
   2. errorHandler          - Global error catching
   3. responseMiddleware    - Adds ctx.success()
   4. ContextMiddleware     - AsyncLocalStorage setup
   5. bodyParser()          - Parse request body
   6. router                - Route handling
   ```

2. **Router** (`router/index.ts`):
   - Uses `@koa/router`
   - Maps routes to controller methods

3. **Controller** (`controller/`):
   - Handles HTTP layer (request/response)
   - Validates input using `validate()` utility with Zod schemas
   - Calls service layer
   - Uses `ctx.success(data)` for responses

4. **Service** (`service/`):
   - Business logic layer
   - May call gRPC services via generated clients
   - Throws `LogicError` for business errors

5. **Validation** (`utils/validate.ts`):
   - Unified validation helper using Zod
   - Validates `body`, `query`, or `params`
   - Auto-responds with error on validation failure

### Key Patterns

**Error Handling:**

- Use `LogicError` from `@sse-wiki/error` for business logic errors
- Define error codes in `error/index.ts` of each app
- Global error handler catches all errors

**Logging:**

- `ctx.logger` available in all middleware/controllers
- `ctx.log(message)` is a shorthand (if implemented)

**Response Format:**

```typescript
// Success
ctx.success({ id: 1, name: 'test' })
// => { code: 0, message: '', data: { id: 1, name: 'test' } }

// Error (handled by errorHandler)
// => { code: -1, message: 'Error message' }
```

**Context Propagation:**

- `ContextMiddleware` stores Koa context in AsyncLocalStorage
- `getCtx()` from `@sse-wiki/context` retrieves context anywhere

**Validation:**

```typescript
import { validate } from '../utils/validate'
import { mySchema } from './schema'

const data = validate(ctx, mySchema, 'body') // or 'query' or 'params'
```

### gRPC Client Generation

The `pb-compiler` package generates TypeScript clients from .proto files:

**Generated Files** (per service):

- `{service}-types.ts` - TypeScript interfaces and enums
- `{service}-service.ts` - Service class wrapping RpcClient

**Type Mappings:**

- 32-bit integers → `number`
- 64-bit integers → `string` (avoid precision loss)
- `bytes` → `Uint8Array`
- `repeated` → `Array<T>`

**Usage:**

```typescript
import { UserService } from './generated/user-service'

const client = new UserService({ serverAddress: 'localhost:50051' })
const user = await client.getUser({ userId: '123' })
client.close()
```

### Build System

**Build Tool**: `tsdown` (TypeScript bundler)

**Base Configurations** (`tsdown.base.ts`):

- `packageTsdownConfig` - For packages (with `.d.ts` files)
- `appTsdownConfig` - For apps (no `.d.ts` files)
- Use `definePackageConfig()` or `defineAppConfig()` in package-specific config

**Default Settings:**

- Format: ESM only
- Target: Node 18+
- Sourcemaps: enabled
- Tree shaking: enabled

**Linting**: ESLint with `@antfu/eslint-config`

**Git Hooks**:

- Husky + lint-staged - Auto-lint on commit
- Commitizen - Enforce conventional commits

## Package Dependencies

**Workspace Dependencies** (use `workspace:*`):

```json
{
  "@sse-wiki/logger": "workspace:*",
  "@sse-wiki/error": "workspace:*"
}
```

**Key External Dependencies:**

- `koa` + `@koa/router` + `@koa/bodyparser` - HTTP framework
- `zod` - Runtime validation
- `@grpc/grpc-js` + `@grpc/proto-loader` - gRPC runtime
- `commander` - CLI framework (pb-compiler)

## Development Workflow

1. **Create New Package:**
   - Copy `packages/template` as starting point
   - Update `package.json` name to `@sse-wiki/<name>`
   - Add to workspace: automatic via `pnpm-workspace.yaml`

2. **Create New App:**
   - Copy `apps/template` as starting point
   - Update `package.json` name to `@sse-wiki/app-<name>`
   - Set `private: true`

3. **Add gRPC Service:**

   ```bash
   cd apps/your-app
   cpb init                    # If no pb.config.json
   cpb add user                # Add service
   # Place user.proto in ./generated/
   cpb generate                # Generate TypeScript client
   ```

4. **Build Order:**
   - Always build packages before apps
   - `pnpm build` builds packages in dependency order
   - `pnpm build:all` builds everything

## Important Conventions

- **Package naming**: `@sse-wiki/<name>`
- **Exports**: Use `export type * from './types'` for type-only exports
- **Error codes**: Define in `error/index.ts`, reuse across controllers
- **Validation schemas**: Define in `controller/{feature}/schema.ts`
- **Service methods**: Should not access `ctx` directly (use parameters)
- **Middleware order matters**: See architecture section above

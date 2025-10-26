# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@sse-wiki/pb-compiler` is a Protocol Buffer compiler CLI tool that generates TypeScript client code from .proto files. It's part of a monorepo (`terminal-terrace-nodejs`) and generates type-safe gRPC clients.

## Build Commands

- **Build**: `pnpm build` or `npm run build` - Compiles TypeScript using tsdown
- **Development**: `pnpm dev` or `npm run dev` - Runs tsdown in watch mode
- **CLI Binary**: `cpb` - The compiled CLI is available at `dist/cli.js`

## CLI Commands

The tool provides several commands through the `cpb` binary:

```bash
cpb init                          # Initialize pb.config.json
cpb generate [-c <config>]        # Generate client code for all services
cpb add <service> [-c <config>]   # Add a new service to config
cpb sync [-c <config>]            # Download/sync all proto files
```

## Architecture

### Core Components

1. **CLI Layer** (`src/cli.ts`):
   - Entry point with Commander.js commands
   - Orchestrates the generation workflow: read config → download/read proto → translate → write files

2. **Configuration** (`src/config.ts`):
   - Manages `pb.config.json` with service list and server address
   - Conventions:
     - Service name (e.g., "user") → proto file: `generated/user.proto`
     - Service name → package name: lowercase service name
     - Service name → class name: PascalCase + "Service" (e.g., "UserService")
   - All generated files go to `./generated/` directory

3. **Translation** (`src/translate.ts`):
   - Parses .proto files using regex
   - Extracts enums, messages, services, and RPC methods
   - Maps proto types to TypeScript:
     - 32-bit integers → `number`
     - 64-bit integers → `string` (to avoid precision loss)
     - `bytes` → `Uint8Array`
   - Generates two files per service:
     - `{service}-types.ts`: TypeScript interfaces and enums
     - `{service}-service.ts`: RpcClient wrapper class

4. **Templates** (`src/template.ts`):
   - String templates for generating TypeScript code
   - Service class wraps `@sse-wiki/rpc-client` RpcClient
   - Generated services include:
     - Constructor accepting optional config (server address override)
     - Typed methods for each RPC call
     - `close()` and `waitForReady()` utilities

5. **Downloader** (`src/downloader.ts`):
   - **NOT YET IMPLEMENTED** - placeholder for remote proto file downloads
   - Currently throws an error; services must use local proto files

### Code Generation Flow

1. Read `pb.config.json` to get service list and server address
2. For each service:
   - Check if `generated/{service}.proto` exists locally
   - If not, attempt download (currently fails - not implemented)
   - Parse proto file to extract types and RPC methods
   - Generate `{service}-types.ts` and `{service}-service.ts`
3. Write all files to `./generated/` directory

### Important Conventions

- **One service per proto file**: Each .proto file should define exactly one service
- **File naming**: Service "user" generates `user-types.ts` and `user-service.ts`
- **Package naming**: Proto package name must match lowercase service name
- **Generated code location**: All output goes to `./generated/` (proto files AND TypeScript files)

## Dependencies

- `commander`: CLI framework
- `chalk`: Terminal colors
- `@sse-wiki/rpc-client`: gRPC client runtime (external dependency)

## Build Configuration

Uses `tsdown` with configuration at `tsdown.config.ts`:
- Entry: `src/cli.ts` only (single CLI binary)
- No type declarations (`dts: false`)
- No sourcemaps
- Inherits from monorepo's `tsdown.base.ts`

## Known Limitations

- Proto file downloader (`src/downloader.ts`) is not implemented - services must provide local proto files
- Regex-based parsing (doesn't use official protobuf parser) - may not handle all proto syntax edge cases
- Assumes one service per proto file

import type { Options } from 'tsdown'

/**
 * packages 工具库的基础配置
 * 适用于需要发布到 npm 的工具包
 */
export const packageTsdownConfig: Options = {
  // 默认入口文件
  entry: ['src/index.ts'],

  // 输出格式：仅支持 ESM
  format: ['esm'],

  // 输出目录
  outDir: 'dist',

  // 清理输出目录
  clean: true,

  // 生成类型声明文件
  dts: true,

  // sourcemap
  sourcemap: true,

  // tree shaking
  treeshake: true,

  // 默认排除 node 内置模块
  external: [
    /^node:.*/,
  ],

  // 目标环境
  target: 'node18',

  // 平台
  platform: 'node',
}

/**
 * apps 应用的基础配置
 * 适用于 koa 等 Node.js 应用
 */
export const appTsdownConfig: Options = {
  // 默认入口文件（apps 代码直接放在根目录）
  entry: ['index.ts'],

  // 输出格式：应用通常只需要 ESM
  format: ['esm'],

  // 输出目录
  outDir: 'dist',

  // 清理输出目录
  clean: true,

  // 应用可能不需要类型声明文件
  dts: false,

  // sourcemap
  sourcemap: true,

  // tree shaking
  treeshake: true,

  // 排除所有依赖（应用的依赖在 node_modules 中）
  external: [
    /^node:.*/,
    /^[^./].*/, // 排除所有非相对路径的导入
  ],

  // 目标环境
  target: 'node18',

  // 平台
  platform: 'node',
}

/**
 * 创建 package 配置的工厂函数
 * @param options - 自定义选项，会与基础配置合并
 * @returns 合并后的配置
 */
export function definePackageConfig(options: Partial<Options> = {}): Options {
  const { external: customExternal, ...restOptions } = options

  return {
    ...packageTsdownConfig,
    ...restOptions,
    // 如果提供了自定义 external，则完全覆盖基础配置
    ...(customExternal !== undefined && { external: customExternal }),
  }
}

/**
 * 创建 app 配置的工厂函数
 * @param options - 自定义选项，会与基础配置合并
 * @returns 合并后的配置
 */
export function defineAppConfig(options: Partial<Options> = {}): Options {
  const { external: customExternal, ...restOptions } = options

  return {
    ...appTsdownConfig,
    ...restOptions,
    // 如果提供了自定义 external，则完全覆盖基础配置
    ...(customExternal !== undefined && { external: customExternal }),
  }
}

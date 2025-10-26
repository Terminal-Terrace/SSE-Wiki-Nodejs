import { defineConfig } from 'tsdown'
import { defineAppConfig } from '../../tsdown.base.ts'

export default defineConfig(
  defineAppConfig({
    // 可以在这里覆盖或扩展基础配置
    // entry: ['index.ts'], // 应用入口（默认）
    // entry: ['server.ts'], // 或使用其他入口文件
    // dts: false, // 应用通常不需要类型声明
    sourcemap: false,
  }),
)

import { defineConfig } from 'tsdown'
import { definePackageConfig } from '../../tsdown.base.ts'

export default defineConfig(
  definePackageConfig({
    // 可以在这里覆盖或扩展基础配置
    // entry: ['src/index.ts', 'src/utils.ts'], // 多入口示例
    // dts: true, // 已在基础配置中启用
    // external: ['lodash'], // 额外排除的依赖
    entry: ['src/cli.ts'],
    dts: false,
    sourcemap: false,
  }),
)

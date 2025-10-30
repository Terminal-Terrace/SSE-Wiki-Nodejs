import { defineConfig } from 'tsdown'
import { definePackageConfig } from '../../tsdown.base.ts'

export default defineConfig(
  definePackageConfig({
    // 可以在这里覆盖或扩展基础配置
    entry: ['src/index.ts', 'src/types.ts'], // 多入口
    // dts: true, // 已在基础配置中启用
    // external: ['lodash'], // 额外排除的依赖
  }),
)

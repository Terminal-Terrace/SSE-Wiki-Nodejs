#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色定义
const colors = {
  red: '\x1B[0;31m',
  green: '\x1B[0;32m',
  yellow: '\x1B[1;33m',
  reset: '\x1B[0m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function error(message) {
  log(`错误: ${message}`, colors.red)
}

function success(message) {
  log(message, colors.green)
}

function warning(message) {
  log(`警告: ${message}`, colors.yellow)
}

// 递归复制目录，排除指定文件/目录
function copyDirectory(src, dest, excludeDirs = [], excludeFiles = []) {
  // 创建目标目录
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    // 检查是否需要排除
    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) {
        continue // 跳过排除的目录
      }
      copyDirectory(srcPath, destPath, excludeDirs, excludeFiles)
    }
    else {
      if (excludeFiles.some(pattern => entry.name.match(pattern))) {
        continue // 跳过排除的文件
      }
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 更新 package.json
function updatePackageJson(packageJsonPath, appName) {
  if (!fs.existsSync(packageJsonPath)) {
    warning('未找到 package.json')
    return
  }

  const content = fs.readFileSync(packageJsonPath, 'utf-8')
  const pkg = JSON.parse(content)

  // 更新名称和描述
  pkg.name = `@sse-wiki/app-${appName}`
  pkg.description = `${appName} Koa app for SSE Wiki`

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
  success('✓ package.json 更新完成')
}

// 主函数
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    error('请提供应用名称')
    console.log('用法: node scripts/create-app.js <app-name>')
    console.log('示例: node scripts/create-app.js my-service')
    process.exit(1)
  }

  const appName = args[0]
  const projectRoot = path.resolve(__dirname, '..')
  const templateDir = path.join(projectRoot, 'apps', 'template')
  const targetDir = path.join(projectRoot, 'apps', appName)

  // 验证应用名称格式
  if (!/^[a-z0-9-]+$/.test(appName)) {
    error('应用名称只能包含小写字母、数字和连字符')
    process.exit(1)
  }

  // 检查 template 目录是否存在
  if (!fs.existsSync(templateDir)) {
    error(`模板目录 ${templateDir} 不存在`)
    process.exit(1)
  }

  // 检查目标目录是否已存在
  if (fs.existsSync(targetDir)) {
    error(`目录 apps/${appName} 已存在`)
    process.exit(1)
  }

  success(`开始创建新应用: ${appName}`)
  console.log()

  // 复制文件，排除不需要的目录和文件
  console.log('📦 复制模板文件...')
  const excludeDirs = ['node_modules', 'dist']
  const excludeFiles = [/\.env$/, /\.env\.local$/, /\.log$/, /tsconfig\.tsbuildinfo$/]

  try {
    copyDirectory(templateDir, targetDir, excludeDirs, excludeFiles)
    success('✓ 文件复制完成')
    console.log()
  }
  catch (err) {
    error(`文件复制失败: ${err.message}`)
    process.exit(1)
  }

  // 更新 package.json
  console.log('📝 更新 package.json...')
  const packageJsonPath = path.join(targetDir, 'package.json')
  updatePackageJson(packageJsonPath, appName)
  console.log()

  // 提示后续步骤
  success('🎉 应用创建成功!')
  console.log()
  console.log('后续步骤:')
  console.log(`  1. cd apps/${appName}`)
  console.log('  2. 根据需要修改代码')
  console.log('  3. pnpm install  # 安装依赖')
  console.log('  4. pnpm dev       # 启动开发服务器')
  console.log()
  console.log('目录结构:')
  console.log(`  apps/${appName}/`)
  console.log('  ├── controller/   # 控制器层')
  console.log('  ├── service/      # 业务逻辑层')
  console.log('  ├── middleware/   # 中间件')
  console.log('  ├── router/       # 路由配置')
  console.log('  ├── utils/        # 工具函数')
  console.log('  └── index.ts      # 入口文件')
  console.log()
}

main()

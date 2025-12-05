#!/usr/bin/env node

import type { ConfigManager } from './config'
import type { ServiceInfo } from './template'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Command } from 'commander'
import { readAuthConfig, updateAuthConfig, validateAuthConfig } from './auth-config'
import { initConfig } from './config'
import { downloadProtoFile } from './downloader'
import { protoClassesTemplate } from './template'
import { protoToTs } from './translate'
import { ensureDir } from './utils'

const program = new Command()

/**
 * 生成单个服务的客户端代码
 * @returns ServiceInfo 对象
 */
async function generateService(serviceName: string, config: ConfigManager): Promise<ServiceInfo> {
  console.log(`\n[${serviceName}] 开始生成...`)

  try {
    // 1. 获取 proto 文件路径
    const protoPath = config.getProtoPath(serviceName)

    // 2. 读取 proto 文件
    let protoContent: string
    if (fs.existsSync(protoPath)) {
      console.log(`[${serviceName}] 读取本地 proto 文件: ${protoPath}`)
      protoContent = fs.readFileSync(protoPath, 'utf-8')
    }
    else {
      console.log(`[${serviceName}] proto 文件不存在，尝试下载...`)
      protoContent = await downloadProtoFile(serviceName)

      // 保存下载的 proto 文件
      const protoDir = path.dirname(protoPath)
      ensureDir(protoDir)
      fs.writeFileSync(protoPath, protoContent, 'utf-8')
      console.log(`[${serviceName}] proto 文件已保存: ${protoPath}`)
    }

    // 3. 生成代码
    const result = protoToTs(protoContent)

    // 4. 写入类型文件到 protobuf/types/ 目录
    const typesDir = config.getTypesDir()
    ensureDir(typesDir)

    const typesFile = path.join(typesDir, `${serviceName}.d.ts`)
    fs.writeFileSync(typesFile, result.types, 'utf-8')

    console.log(`[${serviceName}] ✓ 生成成功`)
    console.log(`  - ${typesFile}`)

    // 返回 ServiceInfo
    return {
      protoServiceName: serviceName,
      service: result.service,
    }
  }
  catch (error) {
    console.error(`[${serviceName}] ✗ 生成失败:`, error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * generate 命令 - 生成所有服务的客户端代码
 */
async function generateCommand(options: { config?: string }): Promise<void> {
  try {
    // 初始化配置
    const configPath = options.config || './pb.config.json'
    console.log(`读取配置文件: ${configPath}`)

    const config = initConfig(configPath)
    const pbConfig = config.getConfig()

    if (!pbConfig.services || pbConfig.services.length === 0) {
      console.warn('警告: 配置文件中没有定义任何服务')
      return
    }

    console.log(`找到 ${pbConfig.services.length} 个服务: ${pbConfig.services.join(', ')}`)

    // 生成所有服务，收集 ServiceInfo
    const serviceInfos: ServiceInfo[] = []
    for (const serviceName of pbConfig.services) {
      const serviceInfo = await generateService(serviceName, config)
      serviceInfos.push(serviceInfo)
    }

    // 写入统一的 protoclasses.ts 文件到 protobuf/ 目录
    const outputDir = config.getOutputDir()
    ensureDir(outputDir)
    const protoClassesFile = path.join(outputDir, 'protoclasses.ts')

    // 使用新的模板函数生成完整的 protoclasses.ts
    const combinedCode = protoClassesTemplate(serviceInfos)
    fs.writeFileSync(protoClassesFile, combinedCode, 'utf-8')

    console.log(`\n✓ 所有服务类已写入: ${protoClassesFile}`)
    console.log('\n✓ 所有服务生成完成！')
  }
  catch (error) {
    console.error('\n✗ 生成失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * sync 命令 - 同步所有 proto 文件
 */
async function syncCommand(options: { config?: string, branch?: string }): Promise<void> {
  try {
    const configPath = options.config || './pb.config.json'
    console.log(`读取配置文件: ${configPath}`)

    const config = initConfig(configPath)
    const pbConfig = config.getConfig()

    if (!pbConfig.services || pbConfig.services.length === 0) {
      console.warn('警告: 配置文件中没有定义任何服务')
      return
    }

    const branch = options.branch || 'main'
    console.log(`开始同步 ${pbConfig.services.length} 个服务的 proto 文件 (分支: ${branch})...`)

    // 确保生成目录存在
    const outputDir = config.getOutputDir()
    ensureDir(outputDir)

    // 下载所有 proto 文件
    for (const serviceName of pbConfig.services) {
      try {
        console.log(`\n[${serviceName}] 下载中...`)
        const protoContent = await downloadProtoFile(serviceName, branch)

        const protoPath = config.getProtoPath(serviceName)
        const protoDir = path.dirname(protoPath)
        ensureDir(protoDir)
        fs.writeFileSync(protoPath, protoContent, 'utf-8')
        console.log(`[${serviceName}] ✓ 已保存到 ${protoPath}`)
      }
      catch (error) {
        console.error(`[${serviceName}] ✗ 下载失败:`, error instanceof Error ? error.message : error)
      }
    }

    console.log('\n✓ 同步完成！')
  }
  catch (error) {
    console.error('\n✗ 同步失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * init 命令 - 初始化配置文件
 */
function initCommand(): void {
  const configPath = './pb.config.json'

  if (fs.existsSync(configPath)) {
    console.log(`配置文件已存在: ${configPath}`)
    return
  }

  const defaultConfig = {
    services: [],
  }

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
  console.log(`✓ 已创建配置文件: ${configPath}`)
  console.log('\n下一步:')
  console.log('1. 编辑 pb.config.json，添加服务名到 services 数组')
  console.log('2. 运行 "cpb generate" 生成客户端代码')
}

/**
 * login 命令 - 配置 GitHub Token
 */
function loginCommand(token: string): void {
  try {
    if (!token || token.trim() === '') {
      console.error('✗ GitHub Token 不能为空')
      process.exit(1)
    }

    updateAuthConfig({ githubToken: token })
    console.log('✓ GitHub Token 已保存')
    console.log('\n提示: 使用 "cpb config --owner <owner> --repo <repo>" 配置仓库信息')
  }
  catch (error) {
    console.error('✗ 保存 Token 失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * config 命令 - 配置仓库信息
 */
function configCommand(options: { owner?: string, repo?: string, protoDir?: string, show?: boolean }): void {
  try {
    // 如果是查看配置
    if (options.show) {
      const config = readAuthConfig()
      console.log('当前配置:')
      console.log(`  GitHub Token: ${config.githubToken ? `已配置 (${config.githubToken.substring(0, 8)}...)` : '未配置'}`)
      console.log(`  Repository Owner: ${config.repoOwner || '未配置'}`)
      console.log(`  Repository Name: ${config.repoName || '未配置'}`)
      console.log(`  Proto Directory: ${config.protoDir || '/ (根目录)'}`)

      const validation = validateAuthConfig()
      if (!validation.valid) {
        console.log(`\n⚠ 配置不完整，缺少: ${validation.missing.join(', ')}`)
      }
      else {
        console.log('\n✓ 配置完整')
      }
      return
    }

    // 更新配置
    const updates: Partial<{ githubToken: string, repoOwner: string, repoName: string, protoDir: string }> = {}
    let hasUpdates = false

    if (options.owner) {
      updates.repoOwner = options.owner
      hasUpdates = true
    }
    if (options.repo) {
      updates.repoName = options.repo
      hasUpdates = true
    }
    if (options.protoDir !== undefined) {
      updates.protoDir = options.protoDir
      hasUpdates = true
    }

    if (!hasUpdates) {
      console.log('提示: 使用以下选项之一来配置:')
      console.log('  --owner <owner>      设置仓库所有者')
      console.log('  --repo <repo>        设置仓库名')
      console.log('  --proto-dir <dir>    设置 proto 文件目录（可选）')
      console.log('  --show               查看当前配置')
      return
    }

    updateAuthConfig(updates)
    console.log('✓ 配置已更新')

    if (options.owner) {
      console.log(`  Repository Owner: ${options.owner}`)
    }
    if (options.repo) {
      console.log(`  Repository Name: ${options.repo}`)
    }
    if (options.protoDir !== undefined) {
      console.log(`  Proto Directory: ${options.protoDir || '/ (根目录)'}`)
    }

    const validation = validateAuthConfig()
    if (!validation.valid) {
      console.log(`\n提示: 还需要配置: ${validation.missing.join(', ')}`)
    }
  }
  catch (error) {
    console.error('✗ 配置失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * gen-go 命令 - 使用 protoc 生成 Go 代码
 */
async function genGoCommand(options: { config?: string, goOpt?: string[] }): Promise<void> {
  try {
    // 检查 protoc 是否安装
    try {
      execSync('protoc --version', { stdio: 'pipe' })
    }
    catch {
      console.error('✗ 错误: 未找到 protoc 命令')
      console.log('\n请先安装 Protocol Buffers 编译器:')
      console.log('  - macOS: brew install protobuf')
      console.log('  - Linux: apt-get install protobuf-compiler 或 yum install protobuf-compiler')
      console.log('  - 或从 https://github.com/protocolbuffers/protobuf/releases 下载')
      process.exit(1)
    }

    // 检查 protoc-gen-go 是否安装
    try {
      execSync('which protoc-gen-go', { stdio: 'pipe' })
    }
    catch {
      console.error('✗ 错误: 未找到 protoc-gen-go 插件')
      console.log('\n请先安装 Go protobuf 插件:')
      console.log('  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest')
      console.log('\n确保 $GOPATH/bin 在你的 PATH 中')
      process.exit(1)
    }

    // 检查 protoc-gen-go-grpc 是否安装
    try {
      execSync('which protoc-gen-go-grpc', { stdio: 'pipe' })
    }
    catch {
      console.error('✗ 错误: 未找到 protoc-gen-go-grpc 插件')
      console.log('\n请先安装 Go gRPC 插件:')
      console.log('  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest')
      console.log('\n确保 $GOPATH/bin 在你的 PATH 中')
      process.exit(1)
    }

    // 初始化配置
    const configPath = options.config || './pb.config.json'
    console.log(`读取配置文件: ${configPath}`)

    const config = initConfig(configPath)
    const pbConfig = config.getConfig()

    if (!pbConfig.services || pbConfig.services.length === 0) {
      console.warn('警告: 配置文件中没有定义任何服务')
      return
    }

    console.log(`找到 ${pbConfig.services.length} 个服务: ${pbConfig.services.join(', ')}`)

    // 确保输出目录存在
    const goOutputDir = config.getOutputDir()
    ensureDir(goOutputDir)

    // 生成所有服务的 Go 代码
    for (const serviceName of pbConfig.services) {
      try {
        console.log(`\n[${serviceName}] 生成 Go 代码...`)

        // 获取 proto 文件路径
        const protoPath = config.getProtoPath(serviceName)

        if (!fs.existsSync(protoPath)) {
          console.error(`[${serviceName}] ✗ proto 文件不存在: ${protoPath}`)
          console.log(`提示: 请先运行 "cpb sync" 下载 proto 文件`)
          continue
        }

        // 获取 proto 文件所在目录（用于 -I 参数）
        const protobufBaseDir = config.getOutputDir()

        // 调用 protoc 生成 Go 代码
        // --go_out 输出 Go 消息类型
        // --go-grpc_out 输出 gRPC 服务代码
        // --go_opt=paths=source_relative 使用相对路径

        // 构建 --go_opt 参数
        let goOptArgs = '--go_opt=paths=source_relative'
        let goGrpcOptArgs = '--go-grpc_opt=paths=source_relative'

        // 添加用户指定的 --go-opt 参数 (如 M 映射)
        if (options.goOpt && options.goOpt.length > 0) {
          for (const opt of options.goOpt) {
            goOptArgs += ` --go_opt=${opt}`
            // 如果是 M 映射，也需要添加到 go-grpc_opt
            if (opt.startsWith('M')) {
              goGrpcOptArgs += ` --go-grpc_opt=${opt}`
            }
          }
        }

        const cmd = `protoc -I="${protobufBaseDir}" --go_out="${goOutputDir}" ${goOptArgs} --go-grpc_out="${goOutputDir}" ${goGrpcOptArgs} "${protoPath}"`

        console.log(`[${serviceName}] 执行: ${cmd}`)
        execSync(cmd, { stdio: 'inherit' })

        console.log(`[${serviceName}] ✓ 生成成功`)
      }
      catch (error) {
        console.error(`[${serviceName}] ✗ 生成失败:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n✓ Go 代码已生成到: ${goOutputDir}`)
    console.log('✓ 所有服务的 Go 代码生成完成！')
  }
  catch (error) {
    console.error('\n✗ 生成失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// 配置 CLI
program
  .name('cpb')
  .description('Protocol Buffer 客户端代码生成工具')
  .version('1.0.0')

program
  .command('init')
  .description('初始化配置文件 pb.config.json')
  .action(initCommand)

program
  .command('generate')
  .description('生成所有服务的客户端代码')
  .option('-c, --config <path>', '配置文件路径', './pb.config.json')
  .action(generateCommand)

program
  .command('sync')
  .description('同步/下载所有 proto 文件')
  .option('-c, --config <path>', '配置文件路径', './pb.config.json')
  .option('-b, --branch <branch>', '指定分支名', 'main')
  .action(syncCommand)

program
  .command('login <token>')
  .description('配置 GitHub Personal Access Token')
  .action(loginCommand)

program
  .command('config')
  .description('配置 GitHub 仓库信息')
  .option('--owner <owner>', '设置仓库所有者 (organization 或 username)')
  .option('--repo <repo>', '设置仓库名')
  .option('--proto-dir <dir>', '设置 proto 文件在仓库中的目录路径')
  .option('--show', '查看当前配置')
  .action(configCommand)

program
  .command('gen-go')
  .description('使用 protoc 生成 Go 代码')
  .option('-c, --config <path>', '配置文件路径', './pb.config.json')
  .option('--go-opt <opt...>', '传递给 protoc 的 --go_opt 参数 (如 Mproto=path)')
  .action(genGoCommand)

// 解析命令行参数
program.parse()

#!/usr/bin/env node

import type { ConfigManager } from './config'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Command } from 'commander'
import { initConfig } from './config'
import { downloadProtoFile } from './downloader'
import { protoToTs } from './translate'

const program = new Command()

/**
 * 确保目录存在
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * 生成单个服务的客户端代码
 */
async function generateService(serviceName: string, config: ConfigManager): Promise<void> {
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
    const serverAddress = config.getServerAddress()
    const result = protoToTs(protoContent, serviceName, `${serviceName}-types`, serverAddress)

    // 4. 写入文件
    const outputDir = config.getOutputDir()
    ensureDir(outputDir)

    const typesFile = path.join(outputDir, `${serviceName}-types.ts`)
    const serviceFile = path.join(outputDir, `${serviceName}-service.ts`)

    fs.writeFileSync(typesFile, result.types, 'utf-8')
    fs.writeFileSync(serviceFile, result.service, 'utf-8')

    console.log(`[${serviceName}] ✓ 生成成功`)
    console.log(`  - ${typesFile}`)
    console.log(`  - ${serviceFile}`)
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

    // 生成所有服务
    for (const serviceName of pbConfig.services) {
      await generateService(serviceName, config)
    }

    console.log('\n✓ 所有服务生成完成！')
  }
  catch (error) {
    console.error('\n✗ 生成失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * add 命令 - 添加新服务
 */
async function addCommand(serviceName: string, options: { config?: string }): Promise<void> {
  try {
    const configPath = options.config || './pb.config.json'

    // 读取配置文件
    if (!fs.existsSync(configPath)) {
      console.error(`配置文件不存在: ${configPath}`)
      console.log('提示: 请先创建 pb.config.json 文件')
      process.exit(1)
    }

    const configContent = fs.readFileSync(configPath, 'utf-8')
    const pbConfig = JSON.parse(configContent)

    // 检查服务是否已存在
    if (pbConfig.services && pbConfig.services.includes(serviceName)) {
      console.log(`服务 "${serviceName}" 已存在于配置中`)
      return
    }

    // 添加服务
    if (!pbConfig.services) {
      pbConfig.services = []
    }
    pbConfig.services.push(serviceName)

    // 保存配置
    fs.writeFileSync(configPath, JSON.stringify(pbConfig, null, 2), 'utf-8')
    console.log(`✓ 已添加服务 "${serviceName}" 到配置文件`)

    // 询问是否立即生成
    console.log(`\n提示: 运行 "cpb generate" 来生成该服务的客户端代码`)
  }
  catch (error) {
    console.error('✗ 添加失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

/**
 * sync 命令 - 同步所有 proto 文件
 */
async function syncCommand(options: { config?: string }): Promise<void> {
  try {
    const configPath = options.config || './pb.config.json'
    console.log(`读取配置文件: ${configPath}`)

    const config = initConfig(configPath)
    const pbConfig = config.getConfig()

    if (!pbConfig.services || pbConfig.services.length === 0) {
      console.warn('警告: 配置文件中没有定义任何服务')
      return
    }

    console.log(`开始同步 ${pbConfig.services.length} 个服务的 proto 文件...`)

    // 确保生成目录存在
    const outputDir = config.getOutputDir()
    ensureDir(outputDir)

    // 下载所有 proto 文件
    for (const serviceName of pbConfig.services) {
      try {
        console.log(`\n[${serviceName}] 下载中...`)
        const protoContent = await downloadProtoFile(serviceName)

        const protoPath = config.getProtoPath(serviceName)
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
    serverAddress: 'localhost:50051',
  }

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
  console.log(`✓ 已创建配置文件: ${configPath}`)
  console.log('\n下一步:')
  console.log('1. 编辑 pb.config.json，添加服务名到 services 数组')
  console.log('2. 运行 "cpb generate" 生成客户端代码')
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
  .command('add <service>')
  .description('添加新服务到配置')
  .option('-c, --config <path>', '配置文件路径', './pb.config.json')
  .action(addCommand)

program
  .command('sync')
  .description('同步/下载所有 proto 文件')
  .option('-c, --config <path>', '配置文件路径', './pb.config.json')
  .action(syncCommand)

// 解析命令行参数
program.parse()

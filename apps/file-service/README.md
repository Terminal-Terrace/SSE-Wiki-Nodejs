# File Service

文件服务，提供文件上传、分片上传、秒传等功能。

## 启动

```bash
pnpm dev
```

## 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 查看覆盖率
pnpm test -- --coverage
```

### 测试数据库

测试使用mongodb-memory-server进行隔离测试，无需额外配置。如需使用真实MongoDB：

```bash
# 启动测试数据库
docker-compose -f docker-compose.test.yml up -d mongodb-test
```

### 覆盖率

```bash
# 生成覆盖率报告
pnpm test -- --coverage

# 查看HTML报告
open coverage/index.html
```

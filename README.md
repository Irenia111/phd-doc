# PhD-Doc

PhD-Doc 是一个面向地质研究场景的 AI 辅助写作工具，包含聊天、论文润色、论文撰写、文献推荐与繁简转换等功能。

## 本地启动指南

### 1) 环境要求

- Node.js `>= 20`（建议使用最新 LTS）
- `pnpm`（建议 `>= 9`）

可选检查：

```bash
node -v
pnpm -v
```

### 2) 安装依赖

在项目根目录执行：

```bash
pnpm install
```

### 3) 启动开发服务

```bash
pnpm dev
```

启动成功后访问：

- [http://localhost:3000](http://localhost:3000)

### 4) 首次使用配置

本项目不需要本地 `.env` 文件。  
AI 调用通过用户在页面内配置的 OpenRouter Key 完成：

1. 打开 `设置` 页面（`/settings`）
2. 输入 OpenRouter API Key（`sk-or-v1-...`）
3. 点击验证并保存

### 5) 生产模式运行

先构建：

```bash
pnpm build
```

再启动：

```bash
pnpm start
```

## 常用命令

```bash
pnpm dev      # 开发模式
pnpm lint     # 代码检查
pnpm build    # 生产构建
pnpm start    # 运行构建产物
```

## 常见问题

### 端口被占用

开发模式可指定端口：

```bash
pnpm dev -- -p 3001
```

### API Key 验证失败

- 检查 Key 前缀是否为 `sk-or-v1-`
- 检查网络是否可访问 OpenRouter
- 确认所选模型在你的 OpenRouter Key 下可用

### 安装依赖慢

可切换更快的网络环境后重试：

```bash
pnpm install
```


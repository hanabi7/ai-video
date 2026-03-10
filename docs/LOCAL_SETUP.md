# AI Video Creator - 本地启动指南

本文档介绍如何在本地环境启动 AI Video Creator 项目，包括前端、后端和模型服务的完整流程。

---

## 📋 前置要求

| 依赖 | 版本要求 | 安装命令 |
|------|----------|----------|
| Node.js | >= 18.x | [官网下载](https://nodejs.org/) |
| npm | >= 9.x | 随 Node.js 安装 |
| Git | 任意版本 | `apt install git` 或 [官网下载](https://git-scm.com/) |

### 验证环境
```bash
node -v    # 应显示 v18.x.x 或更高
npm -v     # 应显示 9.x.x 或更高
```

---

## 🚀 快速启动（推荐）

### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd ai-video
```

### 2. 安装依赖
```bash
# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 3. 配置环境变量

#### 后端配置 (.env)
```bash
cd ../backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 即梦 API 配置（必需）
# 从 https://jimeng.jianying.com/ 获取
DREAMINA_API_KEY=your_dreamina_api_key_here
DREAMINA_API_BASE_URL=https://api.dreamina.com/v1

# 通义万相 API 配置（可选）
# 从 https://dashscope.aliyun.com/ 获取
TONGYI_API_KEY=your_tongyi_api_key_here
TONGYI_API_BASE_URL=https://dashscope.aliyuncs.com/api/v1
```

### 4. 启动服务

#### 方式一：分别启动（推荐开发使用）

**终端 1 - 启动后端：**
```bash
cd backend
npm run dev
```
后端将运行在 http://localhost:3001

**终端 2 - 启动前端：**
```bash
cd frontend
npm run dev
```
前端将运行在 http://localhost:5173

#### 方式二：一键启动（Linux/Mac）
```bash
# 在项目根目录执行
(cd backend && npm run dev &) && sleep 3 && cd frontend && npm run dev
```

---

## 🔧 服务说明

### 后端服务 (http://localhost:3001)

| 端点 | 说明 |
|------|------|
| GET `/api/health` | 健康检查 |
| POST `/api/images/generate` | 生成图片 |
| GET `/api/images/status/:id` | 查询图片生成状态 |
| POST `/api/videos/generate` | 生成视频 |
| GET `/api/videos/status/:id` | 查询视频生成状态 |
| POST `/api/videos/export` | 导出剪辑视频 |
| GET `/api/platforms` | 获取支持的 AI 平台 |

### 前端服务 (http://localhost:5173)

- 剧本创作：AI 辅助编写剧本、角色、对白
- 分镜图片：基于即梦 API 生成概念图
- 视频生成：支持多平台（即梦/可灵/Luma/Runway）
- 视频剪辑：时间轴编辑、配乐、导出成片

---

## 📦 模型服务配置

### 即梦 API 获取步骤

1. 访问 [jimeng.jianying.com](https://jimeng.jianying.com/)
2. 登录后进入「开发者中心」
3. 创建应用，获取 API Key
4. 将 API Key 填入 `backend/.env` 的 `DREAMINA_API_KEY`

### 可选：通义万相 API

1. 访问 [dashscope.aliyun.com](https://dashscope.aliyun.com/)
2. 创建 API Key
3. 填入 `backend/.env` 的 `TONGYI_API_KEY`

---

## 🛠️ 常见问题

### 1. 端口冲突

**现象：** `Error: listen EADDRINUSE: address already in use :::3001`

**解决：**
```bash
# 查找占用端口的进程
lsof -i :3001

# 终止进程
kill -9 <PID>
```

### 2. 前端页面空白

**现象：** 打开 http://localhost:5173 显示空白页

**排查步骤：**
1. 确认后端已启动：`curl http://localhost:3001/api/health`
2. 检查浏览器控制台是否有报错
3. 清除浏览器缓存后刷新

### 3. API 调用失败

**现象：** 图片/视频生成报错

**排查：**
1. 确认 `.env` 中 API Key 已正确配置
2. 检查 API Key 是否有效（在开发者控制台查看额度）
3. 查看后端日志获取详细错误信息

### 4. 跨域错误

**现象：** 浏览器控制台显示 CORS 错误

**解决：**
- 开发环境已配置代理，无需额外处理
- 如需修改，编辑 `frontend/vite.config.ts`

---

## 📂 项目结构

```
ai-video/
├── backend/              # Express 后端
│   ├── src/
│   │   ├── index.ts      # 入口文件
│   │   ├── routes/       # API 路由
│   │   └── services/     # 业务逻辑
│   ├── .env              # 环境变量
│   └── package.json
├── frontend/             # React 前端
│   ├── src/
│   │   ├── App.tsx       # 主应用
│   │   ├── components/   # 组件
│   │   └── store/        # 状态管理
│   ├── vite.config.ts    # Vite 配置
│   └── package.json
├── sdk/                  # TypeScript SDK
│   └── src/
└── README.md
```

---

## 📝 开发命令

### 后端
```bash
cd backend
npm run dev      # 开发模式（热重载）
npm run build    # 构建生产版本
npm start        # 运行生产版本
```

### 前端
```bash
cd frontend
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

---

## 🔐 生产环境部署

### 环境变量
```env
NODE_ENV=production
PORT=3001
DREAMINA_API_KEY=your_production_key
```

### 构建步骤
```bash
# 构建前端
cd frontend && npm run build

# 构建后端
cd ../backend && npm run build

# 启动生产服务
npm start
```

---

## 📞 支持

- 问题反馈：提交 GitHub Issue
- 文档更新：提交 Pull Request

---

**最后更新：** 2026-03-10

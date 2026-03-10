# AI Video Creator - Windows 系统启动指南

本文档详细介绍如何在 Windows 系统上安装、配置和启动 AI Video Creator 项目。

---

## 📋 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 操作系统 | Windows 10 (64位) | Windows 11 |
| 内存 | 4 GB RAM | 8 GB RAM |
| 磁盘空间 | 2 GB 可用空间 | 5 GB 可用空间 |
| 网络 | 稳定互联网连接 | 宽带网络 |

---

## 🛠️ 环境准备

### 1. 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 **LTS 版本** (推荐 v18.x 或更高)
3. 运行下载的 `.msi` 安装程序
4. 按照安装向导完成安装（保持默认设置即可）
5. 验证安装：

```cmd
# 打开命令提示符 (CMD) 或 PowerShell
node -v    # 应显示 v18.x.x 或更高版本
npm -v     # 应显示 9.x.x 或更高版本
```

### 2. 安装 Git

1. 访问 [Git for Windows](https://git-scm.com/download/win)
2. 下载并运行安装程序
3. 安装过程中保持默认选项（一路 Next）
4. 验证安装：

```cmd
git --version    # 应显示 git version 2.x.x
```

### 3. 安装 Visual Studio Code (推荐)

虽然不是必需的，但 VS Code 是开发 React/TypeScript 项目的最佳编辑器。

1. 访问 [VS Code 官网](https://code.visualstudio.com/)
2. 下载 Windows 版本并安装
3. 推荐安装以下扩展：
   - ESLint
   - Prettier
   - TypeScript Importer

---

## 📥 项目下载

### 方式一：使用 Git 克隆

```cmd
# 选择一个目录存放项目，例如桌面
cd %USERPROFILE%\Desktop

# 克隆项目
git clone https://github.com/hanabi7/ai-video.git

# 进入项目目录
cd ai-video
```

### 方式二：直接下载 ZIP

1. 访问 [GitHub 项目页面](https://github.com/hanabi7/ai-video)
2. 点击绿色 "Code" 按钮 → "Download ZIP"
3. 解压到任意目录（如 `C:\Projects\ai-video`）

---

## 📦 安装依赖

### 1. 安装后端依赖

```cmd
# 进入后端目录
cd backend

# 安装依赖
npm install

# 如果遇到权限错误，尝试：
npm install --legacy-peer-deps
```

### 2. 安装前端依赖

```cmd
# 返回项目根目录
cd ..

# 进入前端目录
cd frontend

# 安装依赖
npm install
```

**常见问题：**

如果遇到 `node-sass` 或 `node-gyp` 编译错误：
```cmd
# 安装 Windows 构建工具
npm install --global windows-build-tools

# 或者使用管理员权限运行 PowerShell
npm install --legacy-peer-deps
```

---

## ⚙️ 配置环境变量

### 1. 后端配置

```cmd
# 进入后端目录
cd backend

# 复制示例配置文件
copy .env.example .env

# 使用记事本编辑 .env 文件
notepad .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# ========== 即梦 API 配置 ==========
# 从 https://jimeng.jianying.com/ 获取
DREAMINA_API_KEY=your_dreamina_api_key_here
DREAMINA_API_BASE_URL=https://api.dreamina.com/v1

# ========== 通义万相 API 配置 ==========
# 可选，从 https://dashscope.aliyun.com/ 获取
TONGYI_API_KEY=your_tongyi_api_key_here
TONGYI_API_BASE_URL=https://dashscope.aliyuncs.com/api/v1
```

### 2. 获取即梦 API Key

1. 访问 [即梦官网](https://jimeng.jianying.com/)
2. 登录账号（支持抖音/手机号登录）
3. 点击右上角头像 → **「开发者中心」**
4. 点击 **「创建应用」**
5. 填写应用名称（如：AI Video Creator）
6. 复制 API Key 到 `.env` 文件的 `DREAMINA_API_KEY` 处

---

## 🚀 启动项目

### 方式一：分别启动（推荐开发使用）

#### 启动后端服务

```cmd
# 打开第一个命令提示符窗口
cd %USERPROFILE%\Desktop\ai-video\backend

# 启动后端
npm run dev
```

看到以下输出表示启动成功：
```
🚀 AI Video Backend Server Started!
=====================================
📡 Server: http://localhost:3001
🔍 Health: http://localhost:3001/api/health
```

#### 启动前端服务

```cmd
# 打开第二个命令提示符窗口
cd %USERPROFILE%\Desktop\ai-video\frontend

# 启动前端
npm run dev
```

看到以下输出表示启动成功：
```
VITE v5.4.21  ready in 130 ms
➜  Local:   http://localhost:5173/
```

### 方式二：使用 Windows 批处理脚本

创建 `start.bat` 文件在项目根目录：

```batch
@echo off
echo ==========================================
echo    AI Video Creator - Windows 启动脚本
echo ==========================================
echo.

:: 启动后端
echo [1/2] 正在启动后端服务...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端
echo [2/2] 正在启动前端服务...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==========================================
echo    服务启动完成！
echo    后端: http://localhost:3001
echo    前端: http://localhost:5173
echo ==========================================
echo.
pause
```

双击运行 `start.bat` 即可同时启动前后端服务。

---

## 🌐 访问应用

启动成功后，在浏览器中访问：

- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:3001

### 验证服务状态

打开浏览器访问：http://localhost:3001/api/health

如果看到以下 JSON 响应，说明后端正常运行：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-03-10T...",
    "version": "1.0.0"
  }
}
```

---

## 🔧 常见问题解决

### 1. 端口被占用

**错误信息：** `Error: listen EADDRINUSE: address already in use :::3001`

**解决方案：**

```cmd
# 查找占用 3001 端口的进程
netstat -ano | findstr :3001

# 终止进程（将 <PID> 替换为实际的进程ID）
taskkill /PID <PID> /F
```

### 2. 前端页面空白

**排查步骤：**

1. 确认后端已启动：`curl http://localhost:3001/api/health`
2. 检查浏览器控制台（F12）是否有报错
3. 清除浏览器缓存后刷新（Ctrl + F5）

### 3. npm install 失败

**错误信息：** `npm ERR! code ENOENT` 或权限错误

**解决方案：**

```cmd
# 清除 npm 缓存
npm cache clean --force

# 使用管理员权限运行 PowerShell
# 右键 PowerShell → "以管理员身份运行"

# 或者使用 npx
npx npm install
```

### 4. CORS 跨域错误

如果看到浏览器控制台有 CORS 错误，编辑 `frontend/vite.config.ts`：

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // 添加以下配置
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### 5. PowerShell 执行策略限制

**错误信息：** `无法加载文件，因为在此系统上禁止运行脚本`

**解决方案：**

```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📁 项目结构

```
ai-video/
├── backend/              # Express 后端
│   ├── src/
│   │   ├── index.ts      # 入口文件
│   │   ├── routes/       # API 路由
│   │   └── services/     # 业务逻辑
│   ├── .env              # 环境变量（需要自己创建）
│   └── package.json
├── frontend/             # React 前端
│   ├── src/
│   │   ├── App.tsx       # 主应用
│   │   ├── components/   # 组件
│   │   ├── store/        # 状态管理
│   │   └── utils/        # 工具函数
│   ├── vite.config.ts    # Vite 配置
│   └── package.json
├── docs/                 # 文档
└── README.md
```

---

## 📝 常用命令

```cmd
# 后端命令
cd backend
npm run dev      # 开发模式（热重载）
npm run build    # 构建生产版本
npm start        # 运行生产版本

# 前端命令
cd frontend
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

---

## 🔄 更新项目

```cmd
# 进入项目目录
cd ai-video

# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有更新）
cd backend && npm install
cd ../frontend && npm install
```

---

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/hanabi7/ai-video/issues
- **文档**: https://github.com/hanabi7/ai-video/tree/main/docs

---

## 🎉 快速开始检查清单

- [ ] 安装 Node.js (v18+)
- [ ] 安装 Git
- [ ] 克隆/下载项目
- [ ] 安装后端依赖 (`cd backend && npm install`)
- [ ] 安装前端依赖 (`cd frontend && npm install`)
- [ ] 创建 `.env` 文件并配置 API Key
- [ ] 启动后端服务 (`npm run dev`)
- [ ] 启动前端服务 (`npm run dev`)
- [ ] 访问 http://localhost:5173

---

**最后更新：** 2026-03-10

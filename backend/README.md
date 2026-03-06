# AI Video Backend

AI 视频创作平台后端服务 - 接入即梦(Dreamina) API

## 功能特性

- 🎨 图片生成 - 通过即梦 API 生成 AI 图片
- 🎬 视频生成 - 通过即梦 API 生成 AI 视频
- 🔄 任务状态轮询 - 自动查询生成任务状态
- 📦 RESTful API - 标准化的 API 接口

## 技术栈

- Node.js + TypeScript
- Express.js
- Axios (HTTP 客户端)

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，添加你的即梦 API Key
```

### 3. 获取即梦 API Key

1. 访问 [即梦开放平台](https://jimeng.jianying.com/)
2. 注册并创建应用
3. 获取 App ID 和 App Secret
4. 将 API Key 填入 `.env` 文件

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动

### 5. 生产部署

```bash
npm run build
npm start
```

## API 接口

### 图片生成

**POST** `/api/images/generate`

请求体：
```json
{
  "prompt": "都市夜景，女主角站在天桥上",
  "ratio": "16:9",
  "style": "cinematic",
  "reference_image": "base64..."
}
```

### 视频生成

**POST** `/api/videos/generate`

请求体：
```json
{
  "prompt": "女主角从街道尽头走来，镜头缓慢推进",
  "duration": 5,
  "aspect_ratio": "16:9",
  "style": "cinematic",
  "image_url": "https://..."
}
```

### 查询任务状态

**GET** `/api/images/status/:id`
**GET** `/api/videos/status/:id`

### 健康检查

**GET** `/api/health`

## 前端配置

在前端 `.env` 文件中设置：

```
VITE_API_BASE_URL=http://localhost:3001/api
```

## 目录结构

```
backend/
├── src/
│   ├── index.ts          # 入口文件
│   ├── routes/
│   │   ├── images.ts     # 图片相关路由
│   │   └── videos.ts     # 视频相关路由
│   ├── services/
│   │   └── dreamina.ts   # 即梦 API 服务
│   ├── types/
│   │   └── index.ts      # 类型定义
│   └── utils/
│       └── api.ts        # 工具函数
├── package.json
├── tsconfig.json
└── .env.example
```

## 注意事项

1. **API Key 安全**：生产环境不要将 API Key 暴露在客户端
2. **任务存储**：当前使用内存存储任务状态，生产环境建议使用 Redis
3. **文件上传**：支持 base64 图片上传，单文件限制 50MB
4. **超时处理**：图片生成约 10-30 秒，视频生成约 1-3 分钟

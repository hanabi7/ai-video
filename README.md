# AI Video Creator

AI 短剧创作工作台 - 从剧本到成片的完整解决方案。

## 项目结构

```
ai-video/
├── frontend/          # React + TypeScript 前端
├── backend/           # Express + TypeScript 后端
├── sdk/               # TypeScript SDK + CLI 工具
└── README.md          # 本文件
```

## 功能特性

- 📝 **剧本创作** - AI 辅助编写剧本、角色、对白
- 🎨 **分镜图片** - 基于即梦 API 生成概念图
- 🎬 **视频生成** - 支持多平台 (即梦/可灵/Luma/Runway)
- ✂️ **视频剪辑** - 时间轴编辑、配乐、导出成片

## 快速开始

### 1. 启动后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 添加即梦 API Key

npm install
npm run dev
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 3. 使用 SDK/CLI

```bash
cd sdk
npm install
npm run build

# 使用 CLI 生成图片
npx tsx src/cli.ts image "一只可爱的橘猫" --style anime --wait

# 使用 CLI 生成视频
npx tsx src/cli.ts video "女孩在海边奔跑" --duration 5 --wait
```

## 使用 SDK

```typescript
import { createSDK } from '@ai-video/sdk';

const sdk = createSDK({ baseURL: 'http://localhost:3001/api' });

// 生成图片
const image = await sdk.generateImageAndWait({
  prompt: '赛博朋克城市',
  style: 'cyberpunk',
  ratio: '16:9',
});

// 生成视频
const video = await sdk.generateVideoAndWait({
  prompt: '无人机飞行视角',
  duration: 5,
  platform: 'dreamina',
});
```

## 目录说明

| 目录 | 说明 |
|------|------|
| `frontend/` | React 前端，包含剧本、图片、视频、剪辑四个模块 |
| `backend/` | Express 后端，接入即梦 API |
| `sdk/` | TypeScript SDK，支持代码调用和 CLI |

## 技术栈

- **前端**: React 18, TypeScript, Ant Design, Zustand
- **后端**: Node.js, Express, TypeScript
- **API**: 即梦 Dreamina API

## 环境要求

- Node.js 18+
- 即梦 API Key ([获取地址](https://jimeng.jianying.com/))

## 开发计划

- [x] 前端界面重构 (剧本/图片/视频/剪辑)
- [x] 后端服务搭建
- [x] 接入即梦 API
- [x] SDK + CLI 工具
- [x] 视频剪辑功能完善 (裁剪/分割/排序/导出)
- [ ] 支持更多 AI 平台
- [ ] 项目管理系统

## 创建时间

2026-03-05

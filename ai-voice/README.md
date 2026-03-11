# AI-Voice 配音系统

AI 配音系统 - 支持 CosyVoice/百度/讯飞/MiniMax 多引擎，提供 API、CLI 和前端界面。

## 项目结构

```
ai-voice/
├── backend/          # Node.js + Express 后端 API
├── frontend/         # React + TypeScript 前端
├── cli/              # Node.js CLI 工具
├── models/           # Python CosyVoice 模型服务
└── docs/             # 文档
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 3. 使用 CLI

```bash
cd cli
npm install
npm link
ai-voice --help
```

## 功能特性

- 🎙️ **多引擎支持**: CosyVoice(本地) + 百度/讯飞/MiniMax(API)
- 🎭 **语音克隆**: 3秒样本克隆音色
- 🎚️ **情感控制**: 支持多种情感风格
- ⚡ **流式合成**: 实时语音输出
- 📦 **批量处理**: 支持长文本自动分段
- 🎨 **音色管理**: 预设音色库 + 自定义上传

## API 文档

详见 `docs/API.md`

## 开发计划

- [x] 调研报告
- [ ] 后端 API (进行中)
- [ ] CLI 工具
- [ ] 前端界面
- [ ] 云端部署

## License

MIT

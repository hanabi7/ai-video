import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import { ttsRouter } from './routes/tts';
import { voiceRouter } from './routes/voice';
import { cloneRouter } from './routes/clone';
import { projectRouter } from './routes/project';
import { setupWebSocket } from './websocket';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3002;
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const OUTPUT_DIR = path.join(__dirname, '../outputs');

// 确保目录存在
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(OUTPUT_DIR);

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/outputs', express.static(OUTPUT_DIR));

// 路由
app.use('/api/tts', ttsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/clone', cloneRouter);
app.use('/api/project', projectRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      engines: ['cosyvoice', 'baidu', 'xunfei', 'minimax'],
      timestamp: new Date().toISOString()
    }
  });
});

// 获取引擎列表
app.get('/api/engines', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'cosyvoice',
        name: 'CosyVoice',
        type: 'local',
        description: '阿里开源，中文效果最佳，支持3秒极速克隆',
        supportedFeatures: ['tts', 'clone', 'emotion', 'streaming'],
        languages: ['zh', 'en', 'ja', 'ko'],
        status: 'available'
      },
      {
        id: 'baidu',
        name: '百度智能云',
        type: 'api',
        description: '免费额度足，200万字符/月',
        supportedFeatures: ['tts', 'emotion'],
        languages: ['zh', 'en'],
        status: process.env.BAIDU_APP_ID ? 'available' : 'unconfigured'
      },
      {
        id: 'xunfei',
        name: '讯飞开放平台',
        type: 'api',
        description: '方言支持最好，支持16种中国方言',
        supportedFeatures: ['tts', 'clone'],
        languages: ['zh', 'en', 'dialects'],
        status: process.env.XUNFEI_APP_ID ? 'available' : 'unconfigured'
      },
      {
        id: 'minimax',
        name: 'MiniMax',
        type: 'api',
        description: 'Arena榜第一，中文效果顶尖',
        supportedFeatures: ['tts', 'clone'],
        languages: ['zh', 'en'],
        status: process.env.MINIMAX_API_KEY ? 'available' : 'unconfigured'
      }
    ]
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// WebSocket 设置
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`
🎙️ AI-Voice 配音系统已启动
═══════════════════════════════════
服务端地址: http://localhost:${PORT}
API 文档: http://localhost:${PORT}/api/health
上传目录: ${UPLOAD_DIR}
输出目录: ${OUTPUT_DIR}
═══════════════════════════════════
  `);
});

export { UPLOAD_DIR, OUTPUT_DIR };

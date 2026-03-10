import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入路由
import imageRoutes from './routes/images';
import videoRoutes from './routes/videos';
import editorRoutes from './routes/editor';

// 导入服务工厂（确保服务被初始化）
import './services/factory';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/images', imageRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/editor', editorRoutes);

// 支持的平台列表
app.get('/api/platforms', (req, res) => {
  const { unifiedAIService } = require('./services/factory');
  res.json({
    success: true,
    data: unifiedAIService.getSupportedPlatforms()
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      env: {
        dreamina: process.env.DREAMINA_API_KEY ? 'configured' : 'not configured',
        tongyi: process.env.TONGYI_API_KEY ? 'configured' : 'not configured',
      }
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 AI Video Backend Server Started!
=====================================
📡 Server: http://localhost:${PORT}
🔍 Health: http://localhost:${PORT}/api/health
🎨 Images: http://localhost:${PORT}/api/images/generate
🎬 Videos: http://localhost:${PORT}/api/videos/generate
📋 Platforms: http://localhost:${PORT}/api/platforms
=====================================
  `);
  
  // 检查环境变量
  console.log('Environment Check:');
  console.log(`  DREAMINA_API_KEY: ${process.env.DREAMINA_API_KEY ? '✅ configured' : '⚠️ not set'}`);
  console.log(`  TONGYI_API_KEY: ${process.env.TONGYI_API_KEY ? '✅ configured' : '⏳ waiting for tomorrow'}`);
  console.log('');
});

export default app;

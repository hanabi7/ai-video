import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入路由
import imageRoutes from './routes/images';
import videoRoutes from './routes/videos';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // 前端开发服务器地址
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' })); // 支持大文件上传（base64图片）
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/images', imageRoutes);
app.use('/api/videos', videoRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }
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
=====================================
  `);
  
  // 检查环境变量
  if (!process.env.DREAMINA_API_KEY) {
    console.warn('⚠️  Warning: DREAMINA_API_KEY not set. API calls will fail.');
    console.log('   Copy .env.example to .env and add your API key.\n');
  }
});

export default app;

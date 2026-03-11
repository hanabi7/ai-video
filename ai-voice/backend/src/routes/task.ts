import { Router } from 'express';

const router = Router();

// 获取任务列表
router.get('/list', (req, res) => {
  // 简化实现，生产环境用数据库
  res.json({
    success: true,
    data: []
  });
});

// 批量删除任务
router.delete('/batch', (req, res) => {
  res.json({ success: true, message: '任务已清理' });
});

export { router as TaskRouter };

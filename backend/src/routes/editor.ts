import express from 'express';
import { exportVideo, getExportStatus, cancelExport, getExportHistory, deleteExport } from '../services/exportService';

const router = express.Router();

// 导出视频
router.post('/export', async (req, res, next) => {
  try {
    const { clips, audioTracks, outputFormat, resolution, fps } = req.body;

    if (!clips || !Array.isArray(clips) || clips.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供至少一个视频片段'
      });
    }

    // 验证片段数据
    for (const clip of clips) {
      if (!clip.videoUrl || typeof clip.inPoint !== 'number' || typeof clip.outPoint !== 'number') {
        return res.status(400).json({
          success: false,
          error: '片段数据不完整，需要 videoUrl, inPoint, outPoint'
        });
      }
    }

    const result = await exportVideo({
      clips,
      audioTracks: audioTracks || [],
      outputFormat: outputFormat || 'mp4',
      resolution: resolution || '1080p',
      fps: fps || 30,
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 获取导出状态
router.get('/export/:taskId/status', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const status = await getExportStatus(taskId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

// 取消导出
router.post('/export/:taskId/cancel', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await cancelExport(taskId);

    res.json({
      success: true,
      message: '导出任务已取消'
    });
  } catch (error) {
    next(error);
  }
});

// 获取导出历史
router.get('/exports', async (req, res, next) => {
  try {
    const history = await getExportHistory();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// 删除导出记录
router.delete('/export/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await deleteExport(taskId);

    res.json({
      success: true,
      message: '导出记录已删除'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

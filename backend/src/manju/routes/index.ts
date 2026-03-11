import { Router } from 'express';
import { ManjuController } from '../controllers/ManjuController';

const router = Router();
const controller = new ManjuController();

// 项目 API
router.post('/projects', controller.createProject);
router.get('/projects/:id', controller.getProject);
router.put('/projects/:id', controller.updateProject);

// 时间轴 API
router.post('/projects/:id/timeline/generate', controller.generateTimeline);

// TTS API
router.post('/projects/:id/tts/generate', controller.generateTTS);
router.get('/projects/:id/tts/status/:trackId', controller.getTTSStatus);

// 画面生成 API
router.post('/projects/:id/visuals/generate', controller.generateVisuals);

// 渲染 API
router.post('/projects/:id/render', controller.renderVideo);
router.get('/projects/:id/render/status', controller.getRenderStatus);

export { router as manjuRouter };

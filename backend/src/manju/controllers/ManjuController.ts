import { Request, Response } from 'express';
import { ManjuProjectService } from '../services/ManjuProjectService';
import { TTSService } from '../services/TTSService';
import { VisualService } from '../services/VisualService';
import { EditorService } from '../services/EditorService';

export class ManjuController {
  private projectService: ManjuProjectService;
  private ttsService: TTSService;
  private visualService: VisualService;
  private editorService: EditorService;

  constructor() {
    this.projectService = new ManjuProjectService();
    this.ttsService = new TTSService();
    this.visualService = new VisualService();
    this.editorService = new EditorService();
  }

  // 创建项目
  createProject = async (req: Request, res: Response) => {
    try {
      const project = await this.projectService.create(req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 获取项目
  getProject = async (req: Request, res: Response) => {
    try {
      const project = await this.projectService.findById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 更新项目
  updateProject = async (req: Request, res: Response) => {
    try {
      const project = await this.projectService.update(req.params.id, req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 从剧本生成时间轴
  generateTimeline = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const timeline = await this.projectService.generateTimeline(projectId);
      res.json({ success: true, data: timeline });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 生成配音
  generateTTS = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { trackIds } = req.body;
      
      // 加入队列异步处理
      const jobs = await this.ttsService.generateBatch(projectId, trackIds);
      
      res.json({
        success: true,
        data: {
          message: 'TTS生成任务已加入队列',
          jobCount: jobs.length,
          jobs: jobs.map(j => ({ id: j.id, trackId: j.data.trackId }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 查询TTS状态
  getTTSStatus = async (req: Request, res: Response) => {
    try {
      const { projectId, trackId } = req.params;
      const status = await this.ttsService.getStatus(projectId, trackId);
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 生成画面
  generateVisuals = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { trackIds } = req.body;
      
      const jobs = await this.visualService.generateBatch(projectId, trackIds);
      
      res.json({
        success: true,
        data: {
          message: '画面生成任务已加入队列',
          jobCount: jobs.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 渲染视频
  renderVideo = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const job = await this.editorService.render(projectId);
      
      res.json({
        success: true,
        data: {
          message: '视频渲染任务已加入队列',
          jobId: job.id
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // 查询渲染状态
  getRenderStatus = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const status = await this.editorService.getStatus(projectId);
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}

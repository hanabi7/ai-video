import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import { upload } from '../index';

const router = Router();
const outputDir = path.join(__dirname, '../../outputs');
const voicesDir = path.join(__dirname, '../../voices');
fs.ensureDirSync(voicesDir);

// 存储克隆的音色
const clonedVoices = new Map();

// 加载已保存的音色
const voicesFile = path.join(voicesDir, 'voices.json');
if (fs.existsSync(voicesFile)) {
  const savedVoices = fs.readJsonSync(voicesFile);
  Object.entries(savedVoices).forEach(([id, voice]) => {
    clonedVoices.set(id, voice);
  });
}

// 保存音色到文件
function saveVoices() {
  const voices: Record<string, any> = {};
  clonedVoices.forEach((voice, id) => {
    voices[id] = voice;
  });
  fs.writeJsonSync(voicesFile, voices, { spaces: 2 });
}

// 克隆音色
router.post('/clone', upload.single('audio'), async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请上传音频文件' });
    }

    const voiceId = uuidv4();
    const audioPath = req.file.path;
    const voiceDir = path.join(voicesDir, voiceId);
    fs.ensureDirSync(voiceDir);

    // 保存原始音频
    const targetPath = path.join(voiceDir, 'reference.wav');
    await fs.copy(audioPath, targetPath);

    // 提取音色特征（使用 CosyVoice）
    const task = {
      id: voiceId,
      name: name || `克隆音色_${voiceId.slice(0, 8)}`,
      description,
      status: 'processing',
      audioPath: targetPath,
      createdAt: Date.now()
    };

    // 提取音色特征
    await extractVoiceFeature(task);

    // 保存音色信息
    clonedVoices.set(voiceId, {
      ...task,
      status: 'completed'
    });
    saveVoices();

    // 清理上传的临时文件
    await fs.remove(audioPath);

    res.json({
      success: true,
      data: {
        voiceId,
        name: task.name,
        status: 'completed',
        url: `/voices/${voiceId}/reference.wav`
      }
    });

  } catch (error: any) {
    console.error('Clone voice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '音色克隆失败'
    });
  }
});

// 使用克隆的音色合成
router.post('/synthesize/:voiceId', async (req, res) => {
  try {
    const { voiceId } = req.params;
    const { text, speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: '文本不能为空' });
    }

    const voice = clonedVoices.get(voiceId);
    if (!voice) {
      return res.status(404).json({ success: false, error: '音色不存在' });
    }

    const taskId = uuidv4();
    const outputFile = path.join(outputDir, `${taskId}.wav`);

    // 使用克隆音色合成
    await synthesizeWithClonedVoice(taskId, text, voice, outputFile, speed);

    res.json({
      success: true,
      data: {
        taskId,
        status: 'completed',
        url: `/outputs/${taskId}.wav`
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有克隆音色
router.get('/list', (req, res) => {
  const voices = Array.from(clonedVoices.values()).map(v => ({
    id: v.id,
    name: v.name,
    description: v.description,
    status: v.status,
    createdAt: v.createdAt,
    url: `/voices/${v.id}/reference.wav`
  }));

  res.json({ success: true, data: voices });
});

// 获取单个音色详情
router.get('/:voiceId', (req, res) => {
  const voice = clonedVoices.get(req.params.voiceId);
  if (!voice) {
    return res.status(404).json({ success: false, error: '音色不存在' });
  }

  res.json({
    success: true,
    data: {
      ...voice,
      url: `/voices/${voice.id}/reference.wav`
    }
  });
});

// 删除音色
router.delete('/:voiceId', async (req, res) => {
  try {
    const voice = clonedVoices.get(req.params.voiceId);
    if (!voice) {
      return res.status(404).json({ success: false, error: '音色不存在' });
    }

    // 删除音色目录
    const voiceDir = path.join(voicesDir, req.params.voiceId);
    await fs.remove(voiceDir);

    // 从Map中移除
    clonedVoices.delete(req.params.voiceId);
    saveVoices();

    res.json({ success: true, message: '音色已删除' });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新音色信息
router.put('/:voiceId', (req, res) => {
  const voice = clonedVoices.get(req.params.voiceId);
  if (!voice) {
    return res.status(404).json({ success: false, error: '音色不存在' });
  }

  const { name, description } = req.body;
  if (name) voice.name = name;
  if (description) voice.description = description;
  voice.updatedAt = Date.now();

  clonedVoices.set(req.params.voiceId, voice);
  saveVoices();

  res.json({ success: true, data: voice });
});

// ======== 私有方法 ========

// 提取音色特征
async function extractVoiceFeature(task: any) {
  return new Promise((resolve, reject) => {
    // 调用 CosyVoice 提取音色特征
    const pythonScript = path.join(__dirname, '../../../models/cosyvoice_extract.py');
    const args = [
      pythonScript,
      '--audio', task.audioPath,
      '--output', path.join(voicesDir, task.id, 'feature.pt')
    ];

    // 如果没有 Python 脚本，模拟处理
    if (!fs.existsSync(pythonScript)) {
      console.log('音色特征提取脚本不存在，跳过提取步骤');
      task.status = 'completed';
      resolve(task);
      return;
    }

    const python = spawn('python3', args);
    
    let error = '';
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        task.status = 'completed';
        resolve(task);
      } else {
        task.status = 'failed';
        task.error = error;
        reject(new Error(error));
      }
    });
  });
}

// 使用克隆音色合成
async function synthesizeWithClonedVoice(
  taskId: string,
  text: string,
  voice: any,
  outputFile: string,
  speed: number
) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../../models/cosyvoice_clone.py');
    
    // 如果没有克隆脚本，使用普通合成
    if (!fs.existsSync(pythonScript)) {
      console.log('克隆合成脚本不存在，使用预设音色');
      // 这里可以调用普通合成
      resolve(null);
      return;
    }

    const args = [
      pythonScript,
      '--text', text,
      '--reference', voice.audioPath,
      '--output', outputFile,
      '--speed', String(speed)
    ];

    const python = spawn('python3', args);
    
    let error = '';
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputFile)) {
        resolve(null);
      } else {
        reject(new Error(error || '克隆音色合成失败'));
      }
    });
  });
}

export { router as VoiceRouter };

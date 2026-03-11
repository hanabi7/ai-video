import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();
const outputDir = path.join(__dirname, '../../outputs');

// 任务存储（简化版，生产环境用Redis）
const tasks = new Map();

// 文本转语音
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice = 'cosyvoice_female_01', speed = 1.0, emotion = 'neutral' } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: '文本不能为空' });
    }

    const taskId = uuidv4();
    const outputFile = path.join(outputDir, `${taskId}.wav`);
    
    // 创建任务
    const task = {
      id: taskId,
      type: 'synthesize',
      status: 'pending',
      text,
      voice,
      speed,
      emotion,
      outputFile,
      createdAt: Date.now()
    };
    tasks.set(taskId, task);

    // 根据引擎类型调用不同方法
    const engine = voice.split('_')[0];
    
    switch (engine) {
      case 'cosyvoice':
        await synthesizeWithCosyVoice(task);
        break;
      case 'baidu':
        await synthesizeWithBaidu(task);
        break;
      case 'xunfei':
        await synthesizeWithXunfei(task);
        break;
      case 'minimax':
        await synthesizeWithMiniMax(task);
        break;
      default:
        throw new Error(`不支持的引擎: ${engine}`);
    }

    res.json({
      success: true,
      data: {
        taskId,
        status: 'completed',
        url: `/outputs/${taskId}.wav`
      }
    });

  } catch (error: any) {
    console.error('Synthesize error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '合成失败'
    });
  }
});

// 流式合成（WebSocket 或 SSE）
router.post('/synthesize/stream', async (req, res) => {
  // 实现流式输出
  res.json({ success: true, message: '流式合成开发中' });
});

// 长文本合成（自动分段）
router.post('/synthesize/long', async (req, res) => {
  try {
    const { text, voice = 'cosyvoice_female_01', maxLength = 200 } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: '文本不能为空' });
    }

    const taskId = uuidv4();
    
    // 分段处理
    const segments = splitText(text, maxLength);
    const segmentTasks = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segmentTaskId = `${taskId}_${i}`;
      const outputFile = path.join(outputDir, `${segmentTaskId}.wav`);
      
      const task = {
        id: segmentTaskId,
        type: 'synthesize',
        status: 'pending',
        text: segments[i],
        voice,
        segmentIndex: i,
        totalSegments: segments.length,
        outputFile,
        createdAt: Date.now()
      };
      
      tasks.set(segmentTaskId, task);
      segmentTasks.push(task);
    }

    // 批量合成
    const engine = voice.split('_')[0];
    for (const task of segmentTasks) {
      switch (engine) {
        case 'cosyvoice':
          await synthesizeWithCosyVoice(task);
          break;
        case 'baidu':
          await synthesizeWithBaidu(task);
          break;
        case 'xunfei':
          await synthesizeWithXunfei(task);
          break;
        case 'minimax':
          await synthesizeWithMiniMax(task);
          break;
      }
    }

    res.json({
      success: true,
      data: {
        taskId,
        status: 'completed',
        segments: segmentTasks.length,
        urls: segmentTasks.map((t, i) => ({
          index: i,
          url: `/outputs/${t.id}.wav`
        }))
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查询任务状态
router.get('/task/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: '任务不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...task,
      url: task.status === 'completed' ? `/outputs/${task.id}.wav` : null
    }
  });
});

// ======== 私有方法 ========

// CosyVoice 本地合成
async function synthesizeWithCosyVoice(task: any) {
  return new Promise((resolve, reject) => {
    task.status = 'processing';
    
    // 调用 Python 脚本
    const pythonScript = path.join(__dirname, '../../../models/cosyvoice_inference.py');
    const args = [
      pythonScript,
      '--text', task.text,
      '--output', task.outputFile,
      '--voice', task.voice,
      '--speed', String(task.speed)
    ];

    const python = spawn('python3', args);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(task.outputFile)) {
        task.status = 'completed';
        task.completedAt = Date.now();
        resolve(task);
      } else {
        task.status = 'failed';
        task.error = error || 'Python 进程失败';
        reject(new Error(task.error));
      }
    });
  });
}

// 百度 TTS API
async function synthesizeWithBaidu(task: any) {
  const { BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY } = process.env;
  
  if (!BAIDU_API_KEY || !BAIDU_SECRET_KEY) {
    throw new Error('百度 API 密钥未配置');
  }

  task.status = 'processing';
  
  // 获取 access_token
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_API_KEY}&client_secret=${BAIDU_SECRET_KEY}`;
  const tokenRes = await axios.post(tokenUrl);
  const accessToken = tokenRes.data.access_token;
  
  // 合成语音
  const ttsUrl = `https://tsn.baidu.com/text2audio?tex=${encodeURIComponent(task.text)}&tok=${accessToken}&cuid=${BAIDU_APP_ID || 'ai_voice'}&ctp=1&lan=zh&spd=${Math.round((task.speed - 1) * 10 + 5)}&pit=5&vol=5&per=0`;
  
  const response = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
  await fs.writeFile(task.outputFile, response.data);
  
  task.status = 'completed';
  task.completedAt = Date.now();
}

// 讯飞 TTS API
async function synthesizeWithXunfei(task: any) {
  const { XUNFEI_APP_ID, XUNFEI_API_KEY, XUNFEI_API_SECRET } = process.env;
  
  if (!XUNFEI_APP_ID || !XUNFEI_API_KEY || !XUNFEI_API_SECRET) {
    throw new Error('讯飞 API 密钥未配置');
    }

  task.status = 'processing';
  
  // 讯飞 WebSocket API 实现
  // 这里简化处理，实际需要使用 WebSocket
  const url = 'https://tts-api.xfyun.cn/v2/tts';
  const timestamp = String(Math.floor(Date.now() / 1000));
  
  // 生成鉴权
  const crypto = require('crypto');
  const signatureOrigin = `host: tts-api.xfyun.cn\ndate: ${timestamp}\nGET /v2/tts HTTP/1.1`;
  const signature = crypto.createHmac('sha256', XUNFEI_API_SECRET).update(signatureOrigin).digest('base64');
  const authorization = Buffer.from(`api_key="${XUNFEI_API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`).toString('base64');
  
  const response = await axios.post(url, {
    common: { app_id: XUNFEI_APP_ID },
    business: {
      aue: 'lame',
      sfl: 1,
      auf: 'audio/L16;rate=16000',
      vcn: 'xiaoyan',
      speed: Math.round(task.speed * 50),
      volume: 50,
      pitch: 50,
      bgs: 0
    },
    data: {
      status: 2,
      text: Buffer.from(task.text).toString('base64')
    }
  }, {
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  });
  
  await fs.writeFile(task.outputFile.replace('.wav', '.mp3'), response.data);
  task.status = 'completed';
  task.completedAt = Date.now();
}

// MiniMax TTS API
async function synthesizeWithMiniMax(task: any) {
  const { MINIMAX_API_KEY, MINIMAX_GROUP_ID } = process.env;
  
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    throw new Error('MiniMax API 密钥未配置');
  }

  task.status = 'processing';
  
  const url = `https://api.minimax.chat/v1/t2a?GroupId=${MINIMAX_GROUP_ID}`;
  
  const response = await axios.post(url, {
    model: 'speech-02',
    text: task.text,
    voice_id: task.voice.includes('male') ? 'male-qn-qingse' : 'female-shaonv',
    speed: task.speed
  }, {
    headers: {
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  // MiniMax 返回音频URL
  const audioUrl = response.data.data?.audio_url;
  if (audioUrl) {
    const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(task.outputFile, audioRes.data);
  }
  
  task.status = 'completed';
  task.completedAt = Date.now();
}

// 文本分段
function splitText(text: string, maxLength: number): string[] {
  const segments: string[] = [];
  const sentences = text.match(/[^。？！.?!]+[。？！.?!]+/g) || [text];
  
  let currentSegment = '';
  for (const sentence of sentences) {
    if ((currentSegment + sentence).length <= maxLength) {
      currentSegment += sentence;
    } else {
      if (currentSegment) segments.push(currentSegment.trim());
      currentSegment = sentence;
    }
  }
  if (currentSegment) segments.push(currentSegment.trim());
  
  return segments;
}

export { router as TTSRouter };

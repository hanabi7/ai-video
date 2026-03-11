# AI 项目所需 API 完整清单

本文档汇总了所有项目所需的 AI 能力 API 及申请地址。

---

## 📁 项目一：ai-video（AI 视频生成）

### 1. 即梦 Dreamina API（字节跳动）

| 项目 | 说明 |
|------|------|
| **官网** | https://jimeng.jianying.com/ |
| **API 申请** | https://jimeng.jianying.com/api |
| **能力** | 文生图、图生视频 |
| **费用** | 按量付费，新用户有免费额度 |
| **使用位置** | `ai-video/backend/.env` |

```bash
DREAMINA_API_KEY=your_key
DREAMINA_API_URL=https://api.dreamina.com/v1
```

---

### 2. 可灵 API（快手）

| 项目 | 说明 |
|------|------|
| **官网** | https://kling.kuaishou.com/ |
| **API 申请** | https://kling.kuaishou.com/api-access |
| **能力** | 视频生成、运动表现优秀 |
| **费用** | 按量付费 |
| **使用位置** | `ai-video/backend/.env` |

```bash
KELING_API_KEY=your_key
```

---

### 3. Luma API

| 项目 | 说明 |
|------|------|
| **官网** | https://lumalabs.ai/ |
| **API 申请** | https://lumalabs.ai/api |
| **能力** | 电影级质量视频生成 |
| **费用** | 付费 |
| **使用位置** | `ai-video/backend/.env` |

```bash
LUMA_API_KEY=your_key
```

---

### 4. Runway API

| 项目 | 说明 |
|------|------|
| **官网** | https://runwayml.com/ |
| **API 申请** | https://runwayml.com/api-access |
| **能力** | Gen-2 视频生成，行业标杆 |
| **费用** | 付费订阅 |
| **使用位置** | `ai-video/backend/.env` |

```bash
RUNWAY_API_KEY=your_key
```

---

## 📁 项目二：ai-voice（AI 配音/TTS）

### 1. MiniMax Speech-02（推荐）

| 项目 | 说明 |
|------|------|
| **官网** | https://www.minimax.chat/ |
| **API 申请** | https://www.minimax.chat/user-center/basic-information/interface-key |
| **能力** | Arena榜第一中文TTS，情感丰富 |
| **费用** | 按量付费，约 ¥0.1/分钟 |
| **使用位置** | `ai-voice/backend/.env` / `ai-video/backend/.env` |

```bash
MINIMAX_API_KEY=your_key
```

**文档**: https://platform.minimaxi.com/document/T2A%20V2

---

### 2. 百度智能云 TTS

| 项目 | 说明 |
|------|------|
| **官网** | https://cloud.baidu.com/product/speech/tts |
| **API 申请** | https://console.bce.baidu.com/ai/?_=1710157245033#/ai/speech/app/list |
| **能力** | 免费额度足（200万字符/月） |
| **费用** | 免费额度 + 付费 |
| **使用位置** | `ai-voice/backend/.env` |

```bash
BAIDU_APP_ID=your_app_id
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
```

**文档**: https://cloud.baidu.com/doc/SPEECH/s/qkn8qv6ke

---

### 3. 讯飞开放平台 TTS

| 项目 | 说明 |
|------|------|
| **官网** | https://www.xfyun.cn/services/online_tts |
| **API 申请** | https://console.xfyun.cn/app/myapp |
| **能力** | 16种方言支持，离线SDK |
| **费用** | 免费额度（10万字符/月） |
| **使用位置** | `ai-voice/backend/.env` |

```bash
XUNFEI_APP_ID=your_app_id
XUNFEI_API_KEY=your_api_key
XUNFEI_SECRET_KEY=your_secret_key
```

---

## 📁 开源方案（无需API Key）

### 1. CosyVoice（阿里通义实验室）

| 项目 | 说明 |
|------|------|
| **GitHub** | https://github.com/FunAudioLLM/CosyVoice |
| **部署方式** | Docker / 本地部署 |
| **能力** | 3秒极速克隆，中文效果顶尖 |
| **费用** | 免费（需GPU） |
| **使用位置** | `ai-voice/models/` |

```bash
# 部署命令
git clone https://github.com/FunAudioLLM/CosyVoice.git
cd CosyVoice
pip install -r requirements.txt
python webui.py
```

**访问**: http://localhost:5000

---

### 2. Stable Diffusion（生图）

| 项目 | 说明 |
|------|------|
| **GitHub** | https://github.com/AUTOMATIC1111/stable-diffusion-webui |
| **部署方式** | Docker / 本地部署 |
| **能力** | 开源生图，可控性强 |
| **费用** | 免费（需GPU） |
| **使用位置** | 本地部署 |

```bash
# 部署命令
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
./webui.sh --api  # 启动API模式
```

**API 地址**: http://localhost:7860

---

## 📁 项目三：manju-editor（配音优先创作台）

manju-editor 整合在 ai-video 中，使用相同的 API 配置。

### 所需 API 汇总

| API | 用途 | 申请地址 | 配置位置 |
|-----|------|---------|---------|
| MiniMax Speech-02 | TTS 配音 | https://www.minimax.chat/ | `backend/.env` |
| 百度 TTS（可选） | TTS 备选 | https://cloud.baidu.com/ | `backend/.env` |
| Dreamina API | 生图/生视频 | https://jimeng.jianying.com/ | `backend/.env` |
| Stable Diffusion | 生图（开源） | GitHub 部署 | 本地 http://localhost:7860 |

---

## 🚀 快速配置指南

### 1. 创建 .env 文件

```bash
# ai-video/backend/.env

# === TTS API（配音）===
# MiniMax（推荐）
MINIMAX_API_KEY=your_minimax_key

# 百度（可选）
BAIDU_APP_ID=your_baidu_app_id
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# === 视频生成 API ===
DREAMINA_API_KEY=your_dreamina_key
DREAMINA_API_URL=https://api.dreamina.com/v1

KELING_API_KEY=your_keling_key
LUMA_API_KEY=your_luma_key
RUNWAY_API_KEY=your_runway_key

# === 画图 API ===
# Stable Diffusion 本地部署
SD_URL=http://localhost:7860

# === Redis（任务队列）===
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 💰 费用估算

### 免费方案
- **TTS**: 百度（200万字符/月）+ 讯飞（10万字符/月）
- **生图**: Stable Diffusion 本地部署
- **视频**: Dreamina 免费额度

### 付费方案（高质量）
- **TTS**: MiniMax（¥0.1/分钟）
- **生图**: Dreamina API
- **视频**: 可灵/Dreamina

---

## 📞 API 申请步骤详解

### MiniMax 申请流程
1. 访问 https://www.minimax.chat/
2. 注册账号
3. 进入「用户中心」→「接口密钥」
4. 复制 API Key

### 百度智能云申请流程
1. 访问 https://cloud.baidu.com/
2. 注册/登录百度账号
3. 进入「产品」→「人工智能」→「语音技术」
4. 创建应用，获取 AppID/API Key/Secret Key

### 即梦 Dreamina 申请流程
1. 访问 https://jimeng.jianying.com/
2. 登录抖音/字节账号
3. 进入开发者中心申请 API 权限

---

## 🔧 测试 API 是否可用

```bash
# 测试 MiniMax TTS
curl -X POST https://api.minimax.chat/v1/t2a_v2 \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "speech-01-turbo",
    "text": "你好，这是测试",
    "voice_id": "male-qn-qingse"
  }'

# 测试 Stable Diffusion
curl http://localhost:7860/sdapi/v1/txt2img \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat", "steps": 20}'
```

---

## 📚 相关文档

| 项目 | 文档地址 |
|------|---------|
| MiniMax | https://platform.minimaxi.com/document |
| 百度TTS | https://cloud.baidu.com/doc/SPEECH/index.html |
| 讯飞TTS | https://www.xfyun.cn/doc/tts/online_tts/API.html |
| CosyVoice | https://github.com/FunAudioLLM/CosyVoice |
| Stable Diffusion | https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API |

---

## ⚠️ 注意事项

1. **API Key 安全**: 不要将 `.env` 文件提交到 Git
2. **费用监控**: 设置 API 使用限额，避免意外超支
3. **备用方案**: 建议配置多个 TTS 引擎，互为备份
4. **开源优先**: 对于隐私敏感项目，优先使用 CosyVoice + SD 本地部署

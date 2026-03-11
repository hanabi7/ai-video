# AI Video CLI

AI 视频/图片生成命令行工具 - 支持即梦 Dreamina、可灵、Luma、Runway 等多平台。

## 新增功能：番茄小说素材库 🆕

内置热门小说数据，可直接基于小说快速生成短剧剧本和分镜。

```bash
# 查看小说列表
ai-video novels

# 按题材筛选
ai-video novels --genre 科幻
ai-video novels --genre 都市

# 搜索小说
ai-video novels --search 末日

# 查看小说详情
ai-video novels --detail 1

# 基于小说生成短剧剧本
ai-video novels --script 1
```

支持题材：都市、玄幻、仙侠、科幻、悬疑、历史、军事、游戏、体育、轻小说

---

## 安装

```bash
# 全局安装
npm install -g @ai-video/cli

# 或使用 npx (无需安装)
npx @ai-video/cli --help
```

## 快速开始

### 1. 配置 API 地址

```bash
# 设置后端 API 地址
ai-video config --set apiUrl=http://localhost:3001/api

# 查看配置
ai-video config --list
```

### 2. 生成图片

```bash
# 生成一张图片
ai-video image "一只可爱的橘猫在月亮上" --style anime --ratio 1:1 --wait

# 使用参考图
ai-video image "赛博朋克风格" --ref https://example.com/image.jpg --wait

# 保存结果到文件
ai-video image "海边日落" --wait --output result.json --download ./sunset.png
```

### 3. 生成视频

```bash
# 生成 5 秒视频
ai-video video "女孩在海边奔跑" --duration 5 --platform dreamina --wait

# 使用首帧图片
ai-video video "镜头推进" --image https://example.com/frame.jpg --wait

# 指定平台和风格
ai-video video "赛博朋克城市夜景" --platform luma --style cinematic --duration 10 --wait
```

### 4. 查询任务状态

```bash
# 查询状态
ai-video status img_abc123 --type image

# 持续监控
ai-video status img_abc123 --type image --watch
```

## 命令详解

### `ai-video config`

管理配置信息。

```bash
# 查看所有配置
ai-video config --list

# 设置配置项
ai-video config --set apiUrl=http://localhost:3001/api
ai-video config --set defaultStyle=anime
ai-video config --set defaultRatio=9:16
ai-video config --set defaultPlatform=luma
ai-video config --set defaultDuration=5
```

**配置项说明：**
- `apiUrl` - 后端 API 地址
- `defaultStyle` - 默认风格
- `defaultRatio` - 默认比例
- `defaultPlatform` - 默认视频平台
- `defaultDuration` - 默认视频时长

### `ai-video image`

生成图片。

```bash
ai-video image <prompt> [options]

选项:
  -s, --style <style>      风格: cinematic|anime|realistic|cyberpunk|vintage
  -r, --ratio <ratio>      比例: 16:9|9:16|1:1|4:3
  -n, --negative <prompt>  负面提示词
  --ref <url>              参考图片URL
  -w, --wait               等待生成完成
  -o, --output <file>      输出结果到JSON文件
  -d, --download <path>    下载图片到指定路径
```

### `ai-video video`

生成视频。

```bash
ai-video video <prompt> [options]

选项:
  -s, --style <style>        风格: cinematic|anime|realistic|dreamy|noir
  -r, --ratio <ratio>        比例: 16:9|9:16|1:1
  -d, --duration <seconds>   视频时长 (1-10秒)
  -p, --platform <platform>  平台: dreamina|luma|keling|runway
  --image <url>              首帧图片URL
  -w, --wait                 等待生成完成
  -o, --output <file>        输出结果到JSON文件
```

### `ai-video status`

查询任务状态。

```bash
ai-video status <taskId> [options]

选项:
  -t, --type <type>   任务类型: image|video (默认: image)
  -w, --watch         持续监控状态变化
```

### `ai-video batch`

批量生成任务。

```bash
ai-video batch <config.json> [options]

选项:
  -w, --wait   等待所有任务完成
```

**批量配置文件格式：**

```json
{
  "tasks": [
    {
      "type": "image",
      "request": {
        "prompt": "一只猫",
        "style": "anime",
        "ratio": "1:1"
      }
    },
    {
      "type": "video",
      "request": {
        "prompt": "猫在玩耍",
        "duration": 5,
        "platform": "dreamina"
      }
    }
  ]
}
```

### `ai-video platforms`

列出支持的平台和风格。

```bash
ai-video platforms
```

## 环境变量

```bash
# API 地址 (优先级高于配置文件)
export AI_VIDEO_API_URL=http://localhost:3001/api
```

## 示例

### 批量生成故事板

```bash
# 1. 创建批量配置文件
cat > storyboard.json << 'EOF'
{
  "tasks": [
    { "type": "image", "request": { "prompt": "主角登场", "style": "cinematic", "ratio": "16:9" } },
    { "type": "image", "request": { "prompt": "冲突发生", "style": "cinematic", "ratio": "16:9" } },
    { "type": "image", "request": { "prompt": "高潮对决", "style": "cinematic", "ratio": "16:9" } },
    { "type": "image", "request": { "prompt": "圆满结局", "style": "cinematic", "ratio": "16:9" } }
  ]
}
EOF

# 2. 执行批量生成
ai-video batch storyboard.json
```

### 图片转视频工作流

```bash
# 1. 生成图片
ai-video image "赛博朋克女孩" --style cyberpunk --wait --output image-result.json

# 2. 提取图片 URL
IMAGE_URL=$(cat image-result.json | jq -r '.result_url')

# 3. 用图片生成视频
ai-video video "镜头缓慢推进" --image "$IMAGE_URL" --duration 5 --wait
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/hanabi7/ai-video-cli.git
cd ai-video-cli

# 安装依赖
npm install

# 构建
npm run build

# 本地测试
npm link
ai-video --help
```

## 许可证

MIT

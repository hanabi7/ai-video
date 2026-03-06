# AI Video Creator SDK

AI 图片/视频生成 SDK，封装了与后端 API 的交互。

## 安装

```bash
cd sdk
npm install
npm run build
```

## 使用方式

### 方式 1: 在代码中使用 SDK

```typescript
import { AIVideoSDK, createSDK } from '@ai-video/sdk';

// 创建 SDK 实例
const sdk = createSDK({
  baseURL: 'http://localhost:3001/api',
});

// 生成图片
const result = await sdk.generateImageAndWait({
  prompt: '一只可爱的橘猫',
  style: 'realistic',
  ratio: '1:1',
});

console.log(result.result_url);
```

### 方式 2: 使用 CLI 工具

```bash
# 设置 API 地址
export AI_VIDEO_API_URL=http://localhost:3001/api

# 生成图片（异步）
npx tsx cli.ts image "一只可爱的橘猫" --style realistic --ratio 1:1

# 生成图片（等待完成）
npx tsx cli.ts image "一只可爱的橘猫" --style anime --wait

# 生成视频
npx tsx cli.ts video "女孩在海边奔跑" --duration 5 --platform dreamina --wait

# 查询任务状态
npx tsx cli.ts status img_abc123 image
```

## API 参考

### AIVideoSDK 类

#### 图片生成

```typescript
// 创建任务
const task = await sdk.generateImage({
  prompt: string,           // 图片描述
  style?: string,           // 风格: cinematic|anime|realistic|cyberpunk|vintage
  ratio?: string,           // 比例: 16:9|9:16|1:1|4:3
  negative_prompt?: string, // 负面提示
  reference_image?: string, // 参考图 (base64)
});

// 查询状态
const status = await sdk.getImageStatus(task.id);

// 生成并等待完成
const result = await sdk.generateImageAndWait(request, {
  interval?: number,      // 轮询间隔 (ms)
  maxAttempts?: number,   // 最大尝试次数
  onUpdate?: (status) => void, // 状态更新回调
});
```

#### 视频生成

```typescript
// 创建任务
const task = await sdk.generateVideo({
  prompt: string,           // 视频描述
  duration?: number,        // 时长 (秒)
  aspect_ratio?: string,    // 比例: 16:9|9:16|1:1
  style?: string,           // 风格
  platform?: string,        // 平台: dreamina|luma|keling|runway
  image_url?: string,       // 首帧图 URL
});

// 查询状态
const status = await sdk.getVideoStatus(task.id);

// 生成并等待完成
const result = await sdk.generateVideoAndWait(request, options);
```

#### 批量生成

```typescript
// 批量生成图片
const tasks = await sdk.batchGenerateImages([
  { prompt: '山景', style: 'realistic' },
  { prompt: '海景', style: 'cinematic' },
]);

// 批量生成视频
const tasks = await sdk.batchGenerateVideos([
  { prompt: '日出', duration: 5 },
  { prompt: '日落', duration: 5 },
]);
```

#### 手动轮询

```typescript
const result = await sdk.pollTaskStatus(taskId, 'image', {
  interval: 3000,
  maxAttempts: 60,
  onUpdate: (status) => console.log(status.status),
});
```

## CLI 命令

```
ai-video-cli <command> [options]

Commands:
  image <prompt>    生成图片
  video <prompt>    生成视频
  status <id>       查询任务状态

Options:
  -s, --style      风格
  -r, --ratio      比例
  -d, --duration   视频时长
  -p, --platform   生成平台
  -w, --wait       等待完成
  -o, --output     输出文件
```

## 示例

查看 `src/examples.ts` 获取完整示例。

```bash
# 运行示例
npx tsx src/examples.ts
```

# 安装脚本

## 开发环境安装

```bash
cd ai-video-cli

# 安装依赖
npm install

# 构建
npm run build

# 本地链接
npm link

# 现在可以直接使用 ai-video 命令
ai-video --help
```

## 全局安装

```bash
# 从 npm 安装
npm install -g @ai-video/cli

# 或使用 npx
npx @ai-video/cli --help
```

## 配置

```bash
# 设置 API 地址
ai-video config --set apiUrl=http://your-api-server.com/api

# 设置默认值
ai-video config --set defaultStyle=cinematic
ai-video config --set defaultPlatform=dreamina
```

## 测试

```bash
# 测试图片生成
ai-video image "一只猫" --wait

# 测试视频生成
ai-video video "猫在玩耍" --duration 3 --wait
```

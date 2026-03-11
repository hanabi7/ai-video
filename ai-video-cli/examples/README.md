# 使用示例

## 基础用法

### 生成图片

```bash
# 简单生成
ai-video image "一只可爱的猫"

# 带等待
ai-video image "海边日落" --wait

# 完整参数
ai-video image "赛博朋克城市" --style cyberpunk --ratio 16:9 --wait --output result.json
```

### 生成视频

```bash
# 简单生成
ai-video video "女孩在海边奔跑"

# 带等待
ai-video video "无人机航拍" --duration 5 --wait

# 完整参数
ai-video video "魔法森林" --platform luma --style dreamy --duration 10 --wait
```

## 高级用法

### 图片转视频

```bash
# 先生成图片
ai-video image "科幻场景" --style cinematic --wait --output image.json

# 提取URL并生成视频（需要 jq）
URL=$(jq -r '.result_url' image.json)
ai-video video "镜头推进" --image "$URL" --wait
```

### 批量生成

```bash
ai-video batch examples/batch-example.json
```

### 监控任务

```bash
# 持续监控直到完成
ai-video status task_xxx --type video --watch
```

## 配置文件

```bash
# 查看当前配置
cat ~/.ai-video/config.json

# 常用配置
ai-video config --set apiUrl=http://localhost:3001/api
ai-video config --set defaultStyle=cinematic
ai-video config --set defaultPlatform=dreamina
```

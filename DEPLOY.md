# AI Projects 快速部署指南

ai-video + ai-architecture 一键部署方案

---

## 快速开始（推荐）

### 1. 一键部署

```bash
cd /root/.openclaw/workspace
chmod +x scripts/*.sh
./scripts/deploy-all.sh
```

### 2. 查看状态

```bash
./scripts/status.sh
```

### 3. 访问项目

| 项目 | 前端 | 后端 API |
|------|------|----------|
| **ai-video** | http://localhost:5173 | http://localhost:3001/docs |
| **ai-architecture** | http://localhost:3000 | http://localhost:8000/docs |

---

## 开发模式（自动热重载）

### 文件变更自动重启

```bash
# 监控 ai-video
./scripts/watch-and-reload.sh video

# 监控 ai-architecture
./scripts/watch-and-reload.sh arch

# 监控所有项目
./scripts/watch-and-reload.sh all
```

### 手动控制

```bash
# 停止所有服务
pkill -f "ai-video\|ai-architecture"

# 查看日志
tail -f /tmp/ai-video-backend.log
tail -f /tmp/ai-arch-backend.log
```

---

## Docker 部署（生产环境）

### 1. 构建并启动

```bash
cd /root/.openclaw/workspace

# 开发模式
docker-compose up -d

# 生产模式（带 Nginx）
docker-compose --profile prod up -d
```

### 2. 查看日志

```bash
docker-compose logs -f ai-video-backend
docker-compose logs -f ai-arch-backend
```

### 3. 重建（代码更新后）

```bash
docker-compose up -d --build
```

---

## 目录结构

```
~/workspace/
├── ai-video/
│   ├── backend/      # FastAPI (端口 3001)
│   └── frontend/     # React (端口 5173)
├── ai-architecture/
│   ├── backend/      # FastAPI (端口 8000)
│   └── frontend/     # React (端口 3000)
├── scripts/
│   ├── deploy-all.sh       # 一键部署
│   ├── status.sh           # 查看状态
│   ├── watch-and-reload.sh # 文件监控
│   └── collect_news.py     # 新闻收集
└── docker-compose.yml      # Docker 配置
```

---

## 环境配置

### 后端环境变量

创建 `ai-video/backend/.env`：
```bash
DREAMINA_API_KEY=your_key_here
TONGYI_API_KEY=your_key_here
```

### 前端环境变量

创建 `ai-video/frontend/.env`：
```bash
VITE_API_BASE_URL=http://localhost:3001
```

---

## 常见问题

### Q: 端口被占用？

```bash
# 查看占用端口的进程
lsof -i :3001
lsof -i :5173
lsof -i :8000
lsof -i :3000

# 杀掉进程
pkill -f "ai-video\|ai-architecture"
```

### Q: 如何修改端口？

编辑 `scripts/deploy-all.sh` 修改端口变量，或直接使用 Docker。

### Q: 如何外网访问？

```bash
# 方式1：修改前端配置，指向服务器IP
VITE_API_BASE_URL=http://服务器IP:3001

# 方式2：使用 Nginx 反向代理
docker-compose --profile prod up -d
```

---

## 更新代码后

```bash
# 方法1：使用监控脚本（自动重启）
./scripts/watch-and-reload.sh

# 方法2：手动重启
pkill -f "ai-video\|ai-architecture"
./scripts/deploy-all.sh

# 方法3：Docker 重建
docker-compose up -d --build
```

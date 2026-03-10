# AI Video Creator - 生产环境部署方案

本文档介绍如何将 AI Video Creator 部署到远程服务器，实现通过网页访问。

---

## 🎯 方案概述

### 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
│                   https://your-domain.com               │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────┐
│                    Nginx 反向代理                        │
│              (SSL证书 / 静态资源 / 负载均衡)              │
│  ┌──────────────────┬────────────────────────────────┐ │
│  │  /api/*          │  /*                            │ │
│  │  ↓               │  ↓                             │ │
│  │ 后端服务         │ 前端静态文件                    │ │
│  │ :3001           │ /var/www/ai-video              │ │
│  └──────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │ Docker / Docker Compose
┌─────────────────────────▼───────────────────────────────┐
│                   云服务器 (VPS)                         │
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  ai-video-api   │  │     ai-video-web             │ │
│  │  (Node.js)      │  │     (Nginx + 静态文件)        │ │
│  │  端口: 3001     │  │     端口: 80/443             │ │
│  └─────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## ☁️ 服务器选择

### 推荐云服务

| 服务商 | 配置推荐 | 价格参考 | 特点 |
|--------|---------|---------|------|
| **阿里云 ECS** | 2核4G 1M | ~100元/月 | 国内访问快，备案方便 |
| **腾讯云 CVM** | 2核4G 2M | ~100元/月 | 新用户优惠多 |
| **华为云 ECS** | 2核4G 2M | ~100元/月 | 企业级稳定 |
| **AWS Lightsail** | 2核4G | $10/月 | 全球节点，免备案 |
| **DigitalOcean** | 2核4G | $12/月 | 简单易用，按小时计费 |
| **Vultr** | 2核4G | $12/月 | 全球多节点 |

### 系统选择

推荐 **Ubuntu 22.04 LTS** 或 **CentOS 8**

```bash
# 购买服务器后，通过 SSH 连接
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y  # Ubuntu
yum update -y                # CentOS
```

---

## 🐳 方案一：Docker 部署（推荐）

### 1. 安装 Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 验证安装
docker --version
docker-compose --version
```

### 2. 项目目录结构

在服务器上创建项目目录：

```bash
mkdir -p /opt/ai-video
cd /opt/ai-video
mkdir -p backend frontend nginx
```

### 3. 创建 Dockerfile

**backend/Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm install --production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
```

**frontend/Dockerfile**

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段 - 使用 Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 创建 Docker Compose 配置

**docker-compose.yml**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: ai-video-backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DREAMINA_API_KEY=${DREAMINA_API_KEY}
      - TONGYI_API_KEY=${TONGYI_API_KEY}
    volumes:
      - ./data:/app/data
    networks:
      - ai-video-network

  frontend:
    build: ./frontend
    container_name: ai-video-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ai-video-network

  # 可选：使用 Nginx 作为反向代理
  nginx:
    image: nginx:alpine
    container_name: ai-video-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/var/www/html
    depends_on:
      - backend
      - frontend
    networks:
      - ai-video-network

networks:
  ai-video-network:
    driver: bridge

volumes:
  backend-data:
```

### 5. 环境变量配置

创建 `.env` 文件：

```bash
cat > /opt/ai-video/.env << 'EOF'
# API Keys
DREAMINA_API_KEY=your_dreamina_api_key_here
TONGYI_API_KEY=your_tongyi_api_key_here

# 数据库（如果需要）
DATABASE_URL=sqlite:///app/data/database.sqlite

# JWT Secret
JWT_SECRET=your-secret-key-here
EOF
```

### 6. 部署脚本

**deploy.sh**

```bash
#!/bin/bash

# AI Video Creator 部署脚本

set -e

echo "🚀 开始部署 AI Video Creator..."

# 1. 拉取最新代码
echo "📦 拉取最新代码..."
cd /opt/ai-video
git pull origin main

# 2. 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down

# 3. 构建新镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 4. 启动服务
echo "▶️ 启动服务..."
docker-compose up -d

# 5. 检查状态
echo "✅ 检查服务状态..."
sleep 5
docker-compose ps

echo ""
echo "🎉 部署完成！"
echo "🌐 访问地址: http://your-server-ip"
echo "📊 后端状态: http://your-server-ip:3001/api/health"
```

赋予执行权限：

```bash
chmod +x /opt/ai-video/deploy.sh
```

### 7. 执行部署

```bash
cd /opt/ai-video
./deploy.sh
```

---

## 🔄 方案二：CI/CD 自动化部署（GitHub Actions）

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `SERVER_HOST` - 服务器 IP
- `SERVER_USER` - SSH 用户名
- `SERVER_SSH_KEY` - SSH 私钥
- `DREAMINA_API_KEY` - 即梦 API Key
- `TONGYI_API_KEY` - 通义 API Key

### 2. 创建 GitHub Actions 工作流

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci

    - name: Build frontend
      run: |
        cd frontend
        npm run build

    - name: Deploy to server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        source: "backend/,frontend/,docker-compose.yml,deploy.sh"
        target: "/opt/ai-video"

    - name: Execute deploy script
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /opt/ai-video
          echo "DREAMINA_API_KEY=${{ secrets.DREAMINA_API_KEY }}" > .env
          echo "TONGYI_API_KEY=${{ secrets.TONGYI_API_KEY }}" >> .env
          ./deploy.sh
```

### 3. 自动部署

每次推送代码到 `main` 分支，GitHub Actions 会自动部署到服务器。

---

## 🌐 方案三：Serverless 部署（Vercel + Railway）

### 前端部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署前端
cd frontend
vercel --prod
```

### 后端部署到 Railway

1. 访问 [Railway](https://railway.app/)
2. 连接 GitHub 仓库
3. 选择后端目录
4. 添加环境变量
5. 自动部署

### 配置前端 API 地址

编辑 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://your-railway-app.up.railway.app
```

---

## 🔒 HTTPS 配置（Let's Encrypt）

### 使用 Certbot 申请免费证书

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 申请证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
systemctl enable certbot.timer
systemctl start certbot.timer
```

### 自动配置 HTTPS 的 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 前端静态文件
    location / {
        root /var/www/ai-video;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 📊 监控与日志

### 查看容器日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 系统监控（可选）

安装 PM2 监控 Node.js 进程：

```bash
npm install -g pm2

# 使用 PM2 启动后端（如果不使用 Docker）
pm2 start backend/dist/index.js --name ai-video-api

# 查看状态
pm2 status
pm2 logs

# 保存配置
pm2 save
pm2 startup
```

---

## 🛡️ 安全建议

1. **防火墙配置**
```bash
# 只开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

2. **定期备份**
```bash
# 备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/ai-video_$DATE.tar.gz /opt/ai-video/data
```

3. **更新依赖**
```bash
# 定期更新系统
docker-compose pull
docker-compose up -d
```

---

## 📝 部署检查清单

- [ ] 购买云服务器并配置 SSH
- [ ] 安装 Docker 和 Docker Compose
- [ ] 配置域名解析（DNS）
- [ ] 上传项目代码到服务器
- [ ] 配置环境变量（API Keys）
- [ ] 构建并启动 Docker 容器
- [ ] 配置 Nginx 反向代理
- [ ] 申请并配置 SSL 证书
- [ ] 测试网页访问和 API 调用
- [ ] 配置自动部署（CI/CD）
- [ ] 设置监控和日志收集

---

## 🆘 故障排查

### 容器无法启动

```bash
# 查看详细错误
docker-compose logs backend

# 检查端口占用
netstat -tlnp | grep 3001

# 重启服务
docker-compose restart
```

### 前端无法连接后端

```bash
# 检查后端是否运行
curl http://localhost:3001/api/health

# 检查 Nginx 配置
nginx -t
systemctl restart nginx
```

### HTTPS 证书问题

```bash
# 测试证书
certbot renew --dry-run

# 强制续期
certbot renew --force-renewal
```

---

**最后更新：** 2026-03-10

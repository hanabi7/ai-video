# AI 视频短剧创作工作台 - 部署运行指南

## 项目结构

```
ai-video/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScriptCreator.tsx    # 剧本创作
│   │   │   ├── ImageCreator.tsx     # 图片创作
│   │   │   ├── VideoCreator.tsx     # 视频创作
│   │   │   └── ProjectManager.tsx   # 项目管理
│   │   ├── store/
│   │   │   └── creatorStore.ts      # 状态管理
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── docs/
    └── deployment.md   # 本文件
```

---

## 一、开发环境启动

### 1. 安装依赖

```bash
cd ai-video/frontend
npm install
```

### 2. 本地开发模式

```bash
# 仅本地访问
npm run dev

# 外部可访问（绑定所有IP）
npm run dev -- --host 0.0.0.0

# 指定端口
npm run dev -- --host 0.0.0.0 --port 3001
```

访问地址：
- 本地: `http://localhost:3001`
- 外部: `http://服务器IP:3001`

---

## 二、生产环境部署

### 1. 构建生产版本

```bash
cd ai-video/frontend
npm run build
```

输出目录：`frontend/dist/`

### 2. Nginx 部署（推荐）

#### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nginx

# 验证安装
/usr/sbin/nginx -v
```

#### 配置 Nginx

创建配置文件：

```bash
sudo tee /etc/nginx/sites-available/ai-video << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端开发服务器代理
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API 代理（后端服务）
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
```

启用配置：

```bash
# 创建软链接
sudo ln -sf /etc/nginx/sites-available/ai-video /etc/nginx/sites-enabled/

# 移除默认配置（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo /usr/sbin/nginx -t

# 启动/重载 Nginx
sudo /usr/sbin/nginx
# 或重载配置
sudo /usr/sbin/nginx -s reload
```

#### Nginx 常用命令

```bash
# 启动
sudo /usr/sbin/nginx

# 停止
sudo /usr/sbin/nginx -s stop

# 重载配置
sudo /usr/sbin/nginx -s reload

# 查看状态
ps aux | grep nginx
```

---

## 三、防火墙配置

### 1. 阿里云安全组

登录阿里云控制台 → ECS → 安全组 → 配置规则 → 入方向

添加以下规则：

| 协议类型 | 端口范围 | 授权对象 | 描述 |
|---------|---------|---------|------|
| TCP | 80/80 | 0.0.0.0/0 | HTTP 访问 |
| TCP | 3001/3001 | 0.0.0.0/0 | 前端开发服务 |
| TCP | 8001/8001 | 0.0.0.0/0 | 后端 API（如有） |

### 2. 服务器防火墙（如有）

```bash
# Ubuntu UFW
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
sudo ufw reload

# 或使用 iptables
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT
```

---

## 四、进程管理（PM2）

使用 PM2 保持服务持续运行：

### 1. 安装 PM2

```bash
sudo npm install -g pm2
```

### 2. 启动前端服务

```bash
cd ai-video/frontend

# 使用 PM2 启动
pm2 start npm --name "ai-video-frontend" -- run dev -- --host 0.0.0.0

# 查看状态
pm2 status

# 查看日志
pm2 logs ai-video-frontend

# 重启
pm2 restart ai-video-frontend

# 停止
pm2 stop ai-video-frontend
```

### 3. 开机自启

```bash
pm2 startup
pm2 save
```

---

## 五、快速启动脚本

创建启动脚本：`start.sh`

```bash
#!/bin/bash

echo "🚀 启动 AI 视频创作工作台..."

# 检查前端服务
if ! ss -tlnp | grep -q ":3001"; then
    echo "📦 启动前端服务..."
    cd /root/.openclaw/workspace/ai-video/frontend
    nohup npm run dev -- --host 0.0.0.0 > /tmp/ai-video-frontend.log 2>&1 &
echo $! > /tmp/ai-video-frontend.pid
    sleep 2
fi

# 检查 Nginx
if ! ss -tlnp | grep -q ":80.*nginx"; then
    echo "🌐 启动 Nginx..."
    /usr/sbin/nginx
fi

echo "✅ 服务已启动"
echo ""
echo "访问地址:"
echo "  - 本地: http://localhost:3001"
echo "  - 外网: http://$(curl -s ifconfig.me)"
```

使用方法：

```bash
chmod +x start.sh
./start.sh
```

---

## 六、停止服务

```bash
# 停止前端开发服务器
pkill -f "vite"

# 或根据 PID
kill $(cat /tmp/ai-video-frontend.pid)

# 停止 Nginx
sudo /usr/sbin/nginx -s stop

# 或使用 PM2
pm2 stop ai-video-frontend
pm2 delete ai-video-frontend
```

---

## 七、访问地址

服务启动后，可通过以下地址访问：

| 方式 | 地址 | 说明 |
|------|------|------|
| 本地 | `http://localhost:3001` | 仅本机 |
| IP+端口 | `http://115.191.56.155:3001` | 需放行 3001 |
| 域名/IP | `http://115.191.56.155` | Nginx 代理，需放行 80 |

---

## 八、常见问题

### 1. 端口被占用

```bash
# 查看占用 3001 的进程
ss -tlnp | grep 3001

# 结束进程
kill -9 <PID>
```

### 2. Nginx 启动失败

```bash
# 检查配置语法
sudo /usr/sbin/nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 外网无法访问

检查清单：
1. ✅ 服务监听 `0.0.0.0` 而不是 `127.0.0.1`
2. ✅ 阿里云安全组放行端口
3. ✅ 服务器防火墙放行端口
4. ✅ Nginx 配置正确并重载

---

## 九、当前部署状态

```
服务器: 115.191.56.155
├── Nginx (80端口)     ✅ 运行中
├── 前端服务 (3001)    ✅ 运行中
└── 反向代理           ✅ 已配置

访问地址:
├── http://115.191.56.155:3001  (开发服务)
└── http://115.191.56.155       (Nginx代理)

注意: 阿里云安全组需放行 80 和 3001 端口
```

---

## 十、相关命令速查

```bash
# 一键启动全部
cd /root/.openclaw/workspace/ai-video/frontend && npm run dev -- --host 0.0.0.0 &
/usr/sbin/nginx

# 查看运行状态
ss -tlnp | grep -E "80|3001"
ps aux | grep -E "nginx|node"

# 查看日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

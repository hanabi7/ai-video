#!/bin/bash
# deploy-all.sh - 一键部署 ai-video + ai-architecture
# Usage: ./deploy-all.sh [dev|prod]

set -e

MODE=${1:-dev}
echo "🚀 开始部署 ($MODE 模式)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo "📦 检查依赖..."
    command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ 需要 Node.js${NC}"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ 需要 npm${NC}"; exit 1; }
    command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ 需要 Python 3${NC}"; exit 1; }
    command -v pip3 >/dev/null 2>&1 || { echo -e "${RED}❌ 需要 pip3${NC}"; exit 1; }
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 部署 ai-video
deploy_ai_video() {
    echo ""
    echo "🎬 部署 ai-video..."
    cd /root/.openclaw/workspace/ai-video
    
    # 后端
    echo "  📡 启动后端..."
    cd backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    # 启动后端（后台）
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "    🔄 端口 3001 被占用，重启中..."
        pkill -f "ai-video.*3001" || true
        sleep 2
    fi
    
    nohup python app/main.py > /tmp/ai-video-backend.log 2>&1 &
    echo $! > /tmp/ai-video-backend.pid
    echo "    ✅ 后端已启动 (PID: $(cat /tmp/ai-video-backend.pid))"
    deactivate
    cd ..
    
    # 前端
    echo "  🎨 启动前端..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "    📦 安装依赖..."
        npm install
    fi
    
    if lsof -i :5173 > /dev/null 2>&1; then
        echo "    🔄 端口 5173 被占用，重启中..."
        pkill -f "vite.*ai-video" || true
        sleep 2
    fi
    
    nohup npm run dev > /tmp/ai-video-frontend.log 2>&1 &
    echo $! > /tmp/ai-video-frontend.pid
    echo "    ✅ 前端已启动 (PID: $(cat /tmp/ai-video-frontend.pid))"
    cd ..
    
    echo -e "${GREEN}✅ ai-video 部署完成${NC}"
    echo "  📡 后端: http://localhost:3001"
    echo "  🎨 前端: http://localhost:5173"
}

# 部署 ai-architecture
deploy_ai_architecture() {
    echo ""
    echo "🏗️ 部署 ai-architecture..."
    cd /root/.openclaw/workspace/ai-architecture
    
    # 后端
    echo "  📡 启动后端..."
    cd backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    if lsof -i :8000 > /dev/null 2>&1; then
        echo "    🔄 端口 8000 被占用，重启中..."
        pkill -f "ai-architecture.*8000" || true
        sleep 2
    fi
    
    nohup python app/main.py > /tmp/ai-arch-backend.log 2>&1 &
    echo $! > /tmp/ai-arch-backend.pid
    echo "    ✅ 后端已启动 (PID: $(cat /tmp/ai-arch-backend.pid))"
    deactivate
    cd ..
    
    # 前端
    echo "  🎨 启动前端..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "    📦 安装依赖..."
        npm install
    fi
    
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "    🔄 端口 3000 被占用，重启中..."
        pkill -f "vite.*ai-architecture" || true
        sleep 2
    fi
    
    nohup npm run dev > /tmp/ai-arch-frontend.log 2>&1 &
    echo $! > /tmp/ai-arch-frontend.pid
    echo "    ✅ 前端已启动 (PID: $(cat /tmp/ai-arch-frontend.pid))"
    cd ..
    
    echo -e "${GREEN}✅ ai-architecture 部署完成${NC}"
    echo "  📡 后端: http://localhost:8000"
    echo "  🎨 前端: http://localhost:3000"
}

# 配置 Nginx（生产模式）
setup_nginx() {
    if [ "$MODE" = "prod" ]; then
        echo ""
        echo "🌐 配置 Nginx..."
        
        sudo tee /etc/nginx/sites-available/ai-projects << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # ai-video 前端
    location /video {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # ai-video API
    location /video/api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # ai-architecture 前端
    location /arch {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # ai-architecture API
    location /arch/api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
        
        sudo ln -sf /etc/nginx/sites-available/ai-projects /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo -e "${GREEN}✅ Nginx 配置完成${NC}"
    fi
}

# 显示状态
show_status() {
    echo ""
    echo "📊 部署状态"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "🎬 ai-video:"
    if [ -f /tmp/ai-video-backend.pid ] && kill -0 $(cat /tmp/ai-video-backend.pid) 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} 后端运行中 (PID: $(cat /tmp/ai-video-backend.pid))"
    else
        echo -e "  ${RED}●${NC} 后端未运行"
    fi
    
    if [ -f /tmp/ai-video-frontend.pid ] && kill -0 $(cat /tmp/ai-video-frontend.pid) 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} 前端运行中 (PID: $(cat /tmp/ai-video-frontend.pid))"
    else
        echo -e "  ${RED}●${NC} 前端未运行"
    fi
    
    echo ""
    echo "🏗️ ai-architecture:"
    if [ -f /tmp/ai-arch-backend.pid ] && kill -0 $(cat /tmp/ai-arch-backend.pid) 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} 后端运行中 (PID: $(cat /tmp/ai-arch-backend.pid))"
    else
        echo -e "  ${RED}●${NC} 后端未运行"
    fi
    
    if [ -f /tmp/ai-arch-frontend.pid ] && kill -0 $(cat /tmp/ai-arch-frontend.pid) 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} 前端运行中 (PID: $(cat /tmp/ai-arch-frontend.pid))"
    else
        echo -e "  ${RED}●${NC} 前端未运行"
    fi
    
    echo ""
    echo "🔗 访问地址:"
    echo "  🎬 ai-video:       http://localhost:5173"
    echo "  🎬 ai-video API:   http://localhost:3001"
    echo "  🏗️ ai-architecture: http://localhost:3000"
    echo "  🏗️ ai-arch API:    http://localhost:8000"
    
    echo ""
    echo "📜 日志文件:"
    echo "  /tmp/ai-video-backend.log"
    echo "  /tmp/ai-video-frontend.log"
    echo "  /tmp/ai-arch-backend.log"
    echo "  /tmp/ai-arch-frontend.log"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 主流程
main() {
    echo "🎯 AI Projects 部署脚本"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_dependencies
    deploy_ai_video
    deploy_ai_architecture
    
    if [ "$MODE" = "prod" ]; then
        setup_nginx
    fi
    
    sleep 3  # 等待服务启动
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 部署完成！${NC}"
}

# 执行
main

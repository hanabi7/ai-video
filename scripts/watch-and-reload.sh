#!/bin/bash
# watch-and-reload.sh - 文件变更自动重启（开发模式）

PROJECT=${1:-all}

echo "👀 启动文件监控 ($PROJECT)..."

case $PROJECT in
  video)
    echo "  🎬 监控 ai-video..."
    cd /root/.openclaw/workspace/ai-video
    
    # 后端监控（Python文件变更）
    (while true; do
      inotifywait -e modify,create,delete -r backend/app/ --include '.*\.py$' 2>/dev/null
      echo "  🔄 后端代码变更，重启中..."
      pkill -f "ai-video.*3001" || true
      cd backend && source venv/bin/activate && nohup python app/main.py > /tmp/ai-video-backend.log 2>&1 &
      cd ..
      sleep 2
    done) &
    
    # 前端监控（Vite自带热重载）
    echo "  🎨 前端热重载由 Vite 自动处理"
    ;;
    
  arch)
    echo "  🏗️ 监控 ai-architecture..."
    cd /root/.openclaw/workspace/ai-architecture
    
    # 后端监控
    (while true; do
      inotifywait -e modify,create,delete -r backend/app/ --include '.*\.py$' 2>/dev/null
      echo "  🔄 后端代码变更，重启中..."
      pkill -f "ai-architecture.*8000" || true
      cd backend && source venv/bin/activate && nohup python app/main.py > /tmp/ai-arch-backend.log 2>&1 &
      cd ..
      sleep 2
    done) &
    ;;
    
  all|*)
    echo "  🎬🏗️ 监控所有项目..."
    $0 video
    $0 arch
    ;;
esac

echo "✅ 监控已启动，按 Ctrl+C 停止"
wait

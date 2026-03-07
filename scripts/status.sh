#!/bin/bash
# status.sh - 查看所有服务状态

echo "📊 AI Projects 运行状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查端口占用
check_port() {
    local port=$1
    local name=$2
    if lsof -i :$port > /dev/null 2>&1; then
        pid=$(lsof -t -i :$port)
        echo -e "  🟢 $name (端口 $port) - PID: $pid"
    else
        echo -e "  🔴 $name (端口 $port) - 未运行"
    fi
}

echo ""
echo "🎬 ai-video:"
check_port 3001 "后端"
check_port 5173 "前端"

echo ""
echo "🏗️ ai-architecture:"
check_port 8000 "后端"
check_port 3000 "前端"

echo ""
echo "🌐 OpenClaw Gateway:"
check_port 18789 "Gateway"

echo ""
echo "🔗 快速访问:"
echo "  AI Video:       http://localhost:5173"
echo "  AI Video API:   http://localhost:3001/docs"
echo "  AI Architecture: http://localhost:3000"
echo "  AI Arch API:    http://localhost:8000/docs"
echo "  OpenClaw:       http://localhost:18789"

echo ""
echo "📜 实时日志 (按 Ctrl+C 退出):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 显示最新日志
tail -f /tmp/ai-video-backend.log /tmp/ai-arch-backend.log 2>/dev/null | while read line; do
    echo "[$(date '+%H:%M:%S')] $line"
done

#!/bin/bash

# AI Video Creator - 生产环境部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 AI Video Creator 生产环境部署"
echo "===================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "README.md" ]; then
    echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  未找到 .env 文件，使用示例配置${NC}"
    cp backend/.env.example .env
    echo -e "${RED}请编辑 .env 文件，填入你的 API Keys${NC}"
    exit 1
fi

echo "📦 步骤 1/5: 拉取最新代码..."
git pull origin main

echo "🔨 步骤 2/5: 构建 Docker 镜像..."
docker-compose -f scripts/docker-compose.prod.yml build --no-cache

echo "🛑 步骤 3/5: 停止旧容器..."
docker-compose -f scripts/docker-compose.prod.yml down

echo "▶️  步骤 4/5: 启动服务..."
docker-compose -f scripts/docker-compose.prod.yml up -d

echo "⏳ 步骤 5/5: 等待服务启动..."
sleep 5

# 健康检查
echo "🏥 健康检查..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    docker-compose -f scripts/docker-compose.prod.yml logs backend
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "===================================="
echo "🌐 前端访问: http://localhost"
echo "📡 后端 API: http://localhost:3001"
echo "🔍 健康检查: http://localhost:3001/api/health"
echo ""
echo "📊 查看日志: docker-compose -f scripts/docker-compose.prod.yml logs -f"
echo "🛑 停止服务: docker-compose -f scripts/docker-compose.prod.yml down"
echo "===================================="

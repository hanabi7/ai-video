#!/bin/bash
# NewsAPI 新闻收集脚本
# 每小时运行一次，收集时政新闻

# 配置
API_KEY="${NEWSAPI_KEY:-YOUR_API_KEY_HERE}"
BASE_URL="https://newsapi.org/v2"
NEWS_DIR="/root/.openclaw/workspace/news"
DATE=$(date +%Y-%m-%d)
HOUR=$(date +%H)
FILE="${NEWS_DIR}/${DATE}.md"

# 确保目录存在
mkdir -p "$NEWS_DIR"

# 如果是新的一天，创建文件头
if [ "$HOUR" = "00" ] || [ ! -f "$FILE" ]; then
  echo "## ${DATE} 全球时政新闻简报" > "$FILE"
  echo "" >> "$FILE"
  echo "*自动生成于 $(date '+%Y-%m-%d %H:%M:%S')*" >> "$FILE"
  echo "" >> "$FILE"
  echo "---" >> "$FILE"
  echo "" >> "$FILE"
fi

# 获取当前小时的新闻
echo "" >> "$FILE"
echo "### $(date '+%H:%00') 时段" >> "$FILE"
echo "" >> "$FILE"

# 调用 NewsAPI 获取政治类头条新闻
curl -s "${BASE_URL}/top-headlines?category=politics&language=en&pageSize=10&apiKey=${API_KEY}" | \
python3 << 'PYTHON'
import json
import sys
from datetime import datetime

try:
    data = json.load(sys.stdin)
    articles = data.get('articles', [])
    
    for article in articles[:5]:  # 只取前5条
        title = article.get('title', 'N/A')
        description = article.get('description', 'N/A') or '暂无摘要'
        source = article.get('source', {}).get('name', 'Unknown')
        published = article.get('publishedAt', '')
        url = article.get('url', '')
        
        # 格式化时间
        if published:
            try:
                dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
                time_str = dt.strftime('%H:%M')
            except:
                time_str = published
        else:
            time_str = 'Unknown'
        
        print(f"**{time_str}** [{title}]({url})")
        print(f"- **核心内容**: {description}")
        print(f"- **来源**: {source}")
        print()
        
except Exception as e:
    print(f"获取新闻失败: {e}")
PYTHON

# 添加分隔线
echo "" >> "$FILE"
echo "---" >> "$FILE"

# 保留最近7天的文件
find "$NEWS_DIR" -name "*.md" -mtime +7 -delete 2>/dev/null

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 新闻收集完成: $FILE"

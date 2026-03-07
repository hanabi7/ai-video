#!/usr/bin/env python3
"""
新闻收集脚本 - 支持 NewsAPI 和多数据源
每小时运行一次，收集时政新闻并保存到文件
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# 配置
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', 'YOUR_API_KEY_HERE')
NEWS_DIR = Path('/root/.openclaw/workspace/news')
NEWS_DIR.mkdir(parents=True, exist_ok=True)

class NewsCollector:
    def __init__(self):
        self.api_key = NEWSAPI_KEY
        self.sources = []
        
    def fetch_newsapi(self, category='politics', page_size=10):
        """从 NewsAPI 获取新闻"""
        if self.api_key == 'YOUR_API_KEY_HERE':
            print("错误: 请设置 NEWSAPI_KEY 环境变量")
            return []
        
        url = 'https://newsapi.org/v2/top-headlines'
        params = {
            'category': category,
            'language': 'en',
            'pageSize': page_size,
            'apiKey': self.api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            data = response.json()
            
            if data.get('status') != 'ok':
                print(f"NewsAPI 错误: {data.get('message')}")
                return []
            
            articles = []
            for item in data.get('articles', [])[:5]:
                articles.append({
                    'title': item.get('title', 'N/A'),
                    'description': item.get('description', '暂无摘要') or '暂无摘要',
                    'source': item.get('source', {}).get('name', 'Unknown'),
                    'published_at': item.get('publishedAt', ''),
                    'url': item.get('url', '')
                })
            
            return articles
            
        except Exception as e:
            print(f"请求失败: {e}")
            return []
    
    def format_article(self, article):
        """格式化单条新闻"""
        # 解析时间
        published = article.get('published_at', '')
        if published:
            try:
                dt = datetime.fromisoformat(published.replace('Z', '+00:00'))
                time_str = dt.strftime('%H:%M')
            except:
                time_str = datetime.now().strftime('%H:%M')
        else:
            time_str = datetime.now().strftime('%H:%M')
        
        title = article.get('title', 'N/A')
        description = article.get('description', '暂无摘要')
        source = article.get('source', 'Unknown')
        url = article.get('url', '')
        
        return f"""**{time_str}** [{title}]({url})
- **核心内容**: {description}
- **来源**: {source}
"""
    
    def save_to_file(self, articles):
        """保存新闻到文件"""
        now = datetime.now()
        date_str = now.strftime('%Y-%m-%d')
        hour_str = now.strftime('%H')
        file_path = NEWS_DIR / f"{date_str}.md"
        
        # 如果是新的一天或文件不存在，创建文件头
        if hour_str == '00' or not file_path.exists():
            header = f"""## {date_str} 全球时政新闻简报

*自动生成于 {now.strftime('%Y-%m-%d %H:%M:%S')}*

---

"""
            file_path.write_text(header, encoding='utf-8')
        
        # 追加当前小时的新闻
        with open(file_path, 'a', encoding='utf-8') as f:
            f.write(f"\n### {hour_str}:00 时段\n\n")
            
            if not articles:
                f.write("*暂无新闻更新*\n\n")
            else:
                for article in articles:
                    f.write(self.format_article(article))
                    f.write("\n")
            
            f.write("\n---\n")
        
        print(f"[✓] 新闻已保存: {file_path}")
    
    def run(self):
        """运行收集流程"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始收集新闻...")
        
        # 获取新闻
        articles = self.fetch_newsapi()
        
        # 保存到文件
        self.save_to_file(articles)
        
        # 清理旧文件（保留7天）
        self.cleanup_old_files()
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 完成")
    
    def cleanup_old_files(self):
        """清理7天前的旧文件"""
        try:
            cutoff = datetime.now() - timedelta(days=7)
            for file in NEWS_DIR.glob('*.md'):
                if datetime.fromtimestamp(file.stat().st_mtime) < cutoff:
                    file.unlink()
                    print(f"[✓] 删除旧文件: {file.name}")
        except Exception as e:
            print(f"清理旧文件失败: {e}")

if __name__ == '__main__':
    collector = NewsCollector()
    collector.run()

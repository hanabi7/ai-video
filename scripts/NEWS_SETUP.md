# NewsAPI 新闻收集配置指南

## 1. 获取 NewsAPI Key

1. 访问 https://newsapi.org/
2. 注册账号（免费版每月100次请求）
3. 复制你的 API Key

## 2. 配置环境变量

```bash
# 临时设置（当前会话有效）
export NEWSAPI_KEY="你的API密钥"

# 永久设置（添加到 ~/.bashrc）
echo 'export NEWSAPI_KEY="你的API密钥"' >> ~/.bashrc
source ~/.bashrc
```

## 3. 手动测试

```bash
# 测试 Python 脚本
cd /root/.openclaw/workspace
python3 scripts/collect_news.py

# 或测试 Shell 脚本
./scripts/collect_news.sh
```

## 4. 设置定时任务（Cron）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每小时运行一次）
0 * * * * cd /root/.openclaw/workspace && /usr/bin/python3 /root/.openclaw/workspace/scripts/collect_news.py >> /tmp/news_cron.log 2>&1

# 或每30分钟运行一次
*/30 * * * * cd /root/.openclaw/workspace && /usr/bin/python3 /root/.openclaw/workspace/scripts/collect_news.py >> /tmp/news_cron.log 2>&1
```

## 5. 查看收集的新闻

```bash
# 查看最新新闻文件
ls -la /root/.openclaw/workspace/news/

# 查看今天的新闻
cat /root/.openclaw/workspace/news/$(date +%Y-%m-%d).md
```

## 6. 文件格式示例

```markdown
## 2026-03-07 全球时政新闻简报

*自动生成于 2026-03-07 08:00:00*

---

### 08:00 时段

**08:30** [欧盟通过新气候法案](https://...)
- **核心内容**: 欧盟理事会正式批准2030年碳减排目标修订案
- **来源**: BBC News

**08:15** [联合国安理会召开紧急会议](https://...)
- **核心内容**: 安理会就中东局势进行讨论
- **来源**: Reuters

---

### 09:00 时段

...
```

## 7. 注意事项

- 免费版 NewsAPI 每月100次请求，每小时运行约消耗30次/天
- 如需更多请求，可升级到付费版（$449/月）或使用多个API Key轮换
- 新闻文件保留7天后自动清理

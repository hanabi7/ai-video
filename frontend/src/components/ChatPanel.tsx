import { useState, useRef, useEffect } from 'react';
import { Input, Button, Tag, Dropdown, message } from 'antd';
import { 
  SendOutlined, 
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
  MagicOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useCreatorStore, ScriptMessage } from '../store/creatorStore';
import { v4 as uuidv4 } from 'uuid';
import './ChatPanel.css';

const { TextArea } = Input;

// 快捷指令
const quickCommands = [
  { key: 'synopsis', label: '📖 生成故事梗概', prompt: '请为我的短剧生成一个完整的故事梗概，包含：标题、类型、核心冲突、三幕结构' },
  { key: 'characters', label: '👥 创建角色', prompt: '请帮我创建主要角色，包含：角色名称、性格特点、人物背景、人物关系' },
  { key: 'scene', label: '🎬 写一场戏', prompt: '请写一场戏，包含：场景描述、角色对话、动作指示、情绪氛围' },
  { key: 'dialogue', label: '💬 优化对话', prompt: '请优化以下对话，使其更自然、更有戏剧张力' },
  { key: 'ending', label: '🎭 设计结局', prompt: '请设计一个出人意料但又合理的结局' },
  { key: 'prompt', label: '🎨 生成提示词', prompt: '请将以下场景描述转换为AI图像生成提示词，用于生成分镜图片' },
];

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    scriptMessages, 
    isScriptLoading, 
    addScriptMessage, 
    setScriptLoading,
    characters,
    scenes,
    worldSettings
  } = useCreatorStore();

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scriptMessages]);

  const handleSend = async () => {
    if (!input.trim() || isScriptLoading) return;

    // 添加用户消息
    const userMessage: ScriptMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    addScriptMessage(userMessage);
    setInput('');

    // 模拟AI回复
    setScriptLoading(true);
    
    try {
      // 这里应该调用后端API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage: ScriptMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: Date.now(),
        type: detectMessageType(input)
      };
      addScriptMessage(aiMessage);
      
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setScriptLoading(false);
    }
  };

  const handleQuickCommand = (command: typeof quickCommands[0]) => {
    setInput(command.prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    useCreatorStore.setState({ scriptMessages: [] });
  };

  // 模拟AI响应
  const generateMockResponse = (userInput: string): string => {
    // 获取当前项目上下文
    const contextInfo = [];
    if (characters.length > 0) {
      contextInfo.push(`已有角色：${characters.map(c => c.name).join('、')}`);
    }
    if (scenes.length > 0) {
      contextInfo.push(`已有场景：${scenes.length}个`);
    }
    if (worldSettings.length > 0) {
      contextInfo.push(`世界观设定：${worldSettings.map(w => w.name).join('、')}`);
    }

    if (userInput.includes('提示词') || userInput.includes('prompt')) {
      return `## 🎨 AI生成提示词

根据您的描述，我为您生成了以下图像生成提示词：

### 主要提示词
\`\`\`
Cinematic scene, young woman standing on rooftop at night, 
neon lights reflecting in rain puddles, cyberpunk cityscape 
in background, dramatic lighting, 8k resolution, photorealistic
\`\`\`

### 风格变体

**电影感风格：**
\`\`\`
Cinematic film still, moody atmosphere, shallow depth of field,
blue and orange color grading, anamorphic lens flare
\`\`\`

**动漫风格：**
\`\`\`
Anime style, studio ghibli inspired, vibrant colors, 
dreamy atmosphere, cel shading
\`\`\`

### 建议参数
- **比例**：16:9 或 2.35:1（电影宽屏）
- **风格**：Cinematic / Photorealistic
- **负面提示词**：cartoon, blurry, low quality, distorted

您可以点击提示词旁边的「发送到分镜」按钮，直接用于图片生成。`;
    }
    
    if (userInput.includes('梗概') || userInput.includes('故事')) {
      return `## 📖 《都市奇缘》故事梗概

**类型**：都市爱情轻喜剧
**时长**：15分钟/集，共12集

### 核心设定
讲述一位职场女强人与一位街头艺人因一次意外相遇，从互相看不顺眼到逐渐理解、最终相爱的故事。

### 三幕结构

**第一幕：相遇与冲突**（1-4集）
- 女主林晓是广告公司总监，工作狂，感情空白
- 男主阿杰是街头音乐人，自由洒脱
- 因一场广告拍摄意外相识，理念冲突

**第二幕：了解与磨合**（5-8集）
- 被迫合作一个音乐项目
- 在工作中逐渐发现对方的闪光点
- 各自面临事业与情感的抉择

**第三幕：成长与选择**（9-12集）
- 面对职场危机，阿杰的音乐梦想也遭遇挫折
- 两人互相扶持，共同成长
- 大结局：各自找到平衡，收获爱情与事业

### 核心冲突
职场理性 vs 艺术感性，如何在不改变对方的前提下相爱？`;
    }
    
    if (userInput.includes('角色') || userInput.includes('人物')) {
      return `## 👥 主要角色设定

### 林晓（女主）28岁
**身份**：广告公司创意总监
**性格**：理性、要强、完美主义
**背景**：从小城市考入名校，靠努力在大城市站稳脚跟
**缺陷**：不会表达情感，把工作当避风港
**人物弧光**：学会柔软，发现生活不止KPI

### 阿杰（男主）30岁
**身份**：街头音乐人/独立音乐人
**性格**：随性、乐观、毒舌但温柔
**背景**：富二代但离家出走，追求音乐梦想
**缺陷**：逃避责任，害怕被束缚
**人物弧光**：学会担当，理解自由的代价

### 配角
- **苏苏**：林晓闺蜜，恋爱脑，喜剧担当
- **老陈**：阿杰经纪人，世故但暖心
- **林母**：催婚狂魔，典型中国式家长

💡 **提示**：您可以在「人设」模块中创建这些角色，方便后续剧本创作时引用。`;
    }

    return `收到！我来帮您创作这场戏。

根据您提供的背景，我建议这场戏聚焦**情感转折点**——当两个人物终于放下防备，展现脆弱的一面。

## 第8集 · 天台夜话

### 场景设定
**地点**：写字楼天台  
**时间**：深夜  
**氛围**：城市夜景，远处霓虹，微风

---

**林晓**（望着夜景，罕见地放松）：
> "你知道吗，这是我第一次来公司天台。"

**阿杰**（靠着栏杆，弹唱前奏）：
> "那你的员工肯定很怕你。"

**林晓**（苦笑）：
> "怕？他们说我是个没有感情的KPI机器。"

**阿杰**（停下弹唱，认真）：
> "那你有吗？感情？"

*林晓沉默。夜风吹乱她的头发。*

**林晓**（低声）：
> "我害怕。"

**阿杰**：
> "怕什么？"

**林晓**（眼眶微红）：
> "怕一旦停下来，就会想起自己有多孤单。"

*阿杰递给她一把吉他。*

**阿杰**：
> "那就别停。跟我唱。"

*林晓笨拙地拨动琴弦，走音了。两人相视而笑。*

---

### 创作要点
- **情绪递进**：从戒备 → 自嘲 → 脆弱 → 释然
- **意象运用**：天台象征"逃离"，音乐象征"自由"
- **对白节奏**：长句表达情绪，短句推进节奏

💡 **提示**：您可以选中这段文本，使用右键菜单「生成提示词」功能，将其转换为AI图像生成提示词。需要我展开其他场次吗？`;
  };

  const detectMessageType = (input: string): ScriptMessage['type'] => {
    if (input.includes('梗概') || input.includes('大纲')) return 'scene';
    if (input.includes('角色') || input.includes('人物')) return 'character';
    if (input.includes('对话') || input.includes('台词')) return 'dialogue';
    return 'text';
  };

  return (
    <div className="chat-panel">
      {/* 消息列表 */}
      <div className="messages-container">
        {scriptMessages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-icon">🎬</div>
            <h3>AI 编剧助手</h3>
            <p>描述你的想法，或从快捷指令开始</p>
            
            <div className="quick-start">
              {quickCommands.slice(0, 4).map(cmd => (
                <Tag 
                  key={cmd.key}
                  className="quick-tag"
                  onClick={() => handleQuickCommand(cmd)}
                >
                  {cmd.label}
                </Tag>
              ))}
            </div>
          </div>
        ) : (
          scriptMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`message ${msg.role}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>
              
              <div className="message-content">
                <div className="message-header">
                  <span className="role-name">
                    {msg.role === 'user' ? '我' : 'AI 编剧助手'}
                  </span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="message-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="message-actions">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        message.success('已复制');
                      }}
                    >
                      复制
                    </Button>
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<DownloadOutlined />}
                    >
                      导出
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isScriptLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">
              <LoadingOutlined spin />
            </div>
            <div className="message-content">
              <p>AI 正在创作中...✍️</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-container">
        <div className="chat-toolbar">
          <Dropdown
            menu={{
              items: quickCommands.map(cmd => ({
                key: cmd.key,
                label: cmd.label,
                onClick: () => handleQuickCommand(cmd)
              }))
            }}
          >
            <Button size="small">快捷指令 ▼</Button>
          </Dropdown>
          
          <Button 
            size="small" 
            icon={<ClearOutlined />}
            onClick={clearHistory}
            disabled={scriptMessages.length === 0}
          >
            清空
          </Button>
        </div>
        
        <div className="chat-input-wrapper">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的剧本想法，或输入角色/场景/对白需求...&#10;Enter 发送，Shift+Enter 换行"
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={isScriptLoading}
          />
          
          <Button
            type="primary"
            icon={isScriptLoading ? <LoadingOutlined /> : <SendOutlined />}
            onClick={handleSend}
            loading={isScriptLoading}
            className="chat-send-btn"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

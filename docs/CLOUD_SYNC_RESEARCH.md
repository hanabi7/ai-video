# AI Video Creator - 云同步方案调研

本文档调研适用于 AI Video Creator 项目的文件云同步方案。

---

## 一、需求分析

### 1.1 同步内容
- 剧本项目数据（人设、大纲、场景、世界观）
- 生成的图片和视频资源
- 剪辑项目和时间轴配置
- 用户偏好设置

### 1.2 核心需求
| 需求 | 优先级 | 说明 |
|------|--------|------|
| 数据持久化 | P0 | 防止数据丢失 |
| 跨设备同步 | P1 | 多设备无缝切换 |
| 离线可用 | P1 | 无网络时也能编辑 |
| 版本历史 | P2 | 支持回滚到历史版本 |
| 协作功能 | P3 | 多人协作编辑 |

---

## 二、方案对比

### 2.1 WebDAV

**原理**：基于 HTTP 协议的开放标准，支持文件读写操作

**优点**：
- 开放标准，不受特定厂商绑定
- 支持坚果云、 ownCloud 等国内可访问的服务
- 实现简单，前端可直接操作
- 隐私性好，可自建服务器

**缺点**：
- 无原生版本控制
- 冲突处理需自行实现
- 大文件同步效率一般

**适用场景**：
- 个人用户，已有 WebDAV 服务（如坚果云）
- 需要数据自主可控
- 中小规模项目

**开源工具**：
- `webdav-client` (npm) - WebDAV 客户端库
- `jsdav` - 浏览器端 WebDAV 实现

---

### 2.2 云存储 API (S3/对象存储)

**原理**：通过云服务商 API 直接操作对象存储

**支持服务**：
- 阿里云 OSS
- 腾讯云 COS
- AWS S3
- Cloudflare R2
- MinIO (自建)

**优点**：
- 性能优异，大文件处理能力强
- 成本可控，按需付费
- 可靠性高（99.9999999% SLA）
- 支持 CDN 加速

**缺点**：
- 需要单独开发同步逻辑
- 冲突解决复杂
- 部分服务国内访问受限

**适用场景**：
- 媒体资源（图片/视频）存储
- 大规模用户产品
- 需要 CDN 加速的场景

**开源工具**：
- `aws-sdk` - AWS S3 官方 SDK
- `ali-oss` - 阿里云 OSS SDK
- `cos-nodejs-sdk-v5` - 腾讯云 COS SDK
- `minio` - MinIO 客户端

---

### 2.3 Git 同步

**原理**：利用 Git 版本控制系统管理项目文件

**优点**：
- 原生版本控制
- 冲突解决机制成熟
- 支持分支和协作
- 差量同步，节省带宽

**缺点**：
- 大二进制文件支持差（需配合 LFS）
- 学习曲线陡峭
- 不适合非技术用户
- 私有仓库有容量限制

**适用场景**：
- 技术用户
- 纯文本为主的轻量项目
- 需要严格版本控制

**开源工具**：
- `isomorphic-git` - 浏览器端 Git 实现
- `nodegit` - Node.js Git 绑定
- `simple-git` - 简化 Git 操作

---

### 2.4 实时数据库 (Firebase/Firestore)

**原理**：使用实时数据库作为后端存储

**优点**：
- 实时同步，多端即时更新
- 离线支持（Firestore 离线持久化）
- 无需自建服务器
- 自动冲突解决

**缺点**：
- 厂商锁定
- 国内访问不稳定（Firebase）
- 复杂查询能力有限
- 大文件存储成本高

**适用场景**：
- 需要实时协作
- 海外用户为主
- 快速原型开发

**替代方案（国内）**：
- 腾讯云 CloudBase
- 阿里云实时数据库
- LeanCloud

---

### 2.5 本地文件同步 + 云盘

**原理**：将项目数据存储在本地文件夹，利用云盘客户端自动同步

**优点**：
- 实现最简单
- 用户已有云盘即可使用
- 离线编辑体验最佳
- 无需额外开发

**缺点**：
- 依赖用户安装云盘客户端
- 冲突处理依赖云盘自身
- 无法精细控制同步策略

**适用场景**：
- MVP 阶段
- 个人本地使用
- 快速验证需求

---

## 三、推荐方案

### 3.1 短期方案（MVP）

**选择**：本地存储 + 云盘同步

**实现**：
1. 项目数据存储在用户本地目录（如 `~/Documents/AI-Video-Projects/`）
2. 使用 JSON 格式保存项目结构
3. 资源文件（图片/视频）保存在项目子目录
4. 用户可自行配置云盘同步该目录

**代码实现**：
```typescript
// 使用 Electron/Node.js 文件 API
import { writeFile, readFile } from 'fs/promises';
import { app } from '@electron/remote';

const PROJECT_DIR = path.join(app.getPath('documents'), 'AI-Video-Projects');

// 保存项目
async function saveProject(project: ScriptProject) {
  const projectPath = path.join(PROJECT_DIR, project.id, 'project.json');
  await writeFile(projectPath, JSON.stringify(project, null, 2));
}
```

---

### 3.2 中期方案（产品化）

**选择**：WebDAV + 云存储混合

**架构**：
```
┌─────────────────────────────────────────┐
│           AI Video Creator              │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  │
│  │ 项目数据 │  │ 媒体资源 │  │ 用户配置│  │
│  │ (JSON)  │  │ (图片/视频)│ │        │  │
│  └────┬────┘  └────┬────┘  └───┬────┘  │
│       │            │            │       │
│  ┌────▼────────────▼────────────▼────┐  │
│  │        同步管理层 (Sync Manager)   │  │
│  └────┬────────────┬────────────┬────┘  │
│       │            │            │       │
│  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐ │
│  │ WebDAV  │  │ 阿里云OSS│  │ 腾讯云COS│ │
│  │(坚果云) │  │         │  │         │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

**实现要点**：
1. **项目数据** → WebDAV（坚果云）- 小文件、频繁修改
2. **媒体资源** → 对象存储 - 大文件、低频修改
3. **冲突处理** → 基于时间戳的 last-write-wins 策略
4. **离线支持** → 本地 IndexedDB 缓存

**推荐库**：
- `webdav-client` - WebDAV 操作
- `ali-oss` - 阿里云 OSS
- `localForage` - 离线缓存

---

### 3.3 长期方案（SaaS）

**选择**：自研后端 + 云存储

**架构**：
```
┌──────────────────────────────────────────┐
│           AI Video Creator 客户端          │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐ │
│  │ React UI│  │ IndexedDB│  │ Sync引擎 │ │
│  └────┬────┘  └────┬────┘  └────┬─────┘ │
│       └─────────────┴─────────────┘       │
│                    │                      │
└────────────────────┼──────────────────────┘
                     │ HTTPS/WebSocket
┌────────────────────▼──────────────────────┐
│           AI Video Cloud 后端              │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  │
│  │ API网关 │  │ 项目服务 │  │ 协作服务 │  │
│  └────┬────┘  └────┬────┘  └────┬─────┘  │
│       └─────────────┼─────────────┘       │
│                     │                     │
│  ┌──────────────────┼──────────────────┐ │
│  │              PostgreSQL              │ │
│  │        (项目元数据 + 版本历史)        │ │
│  └──────────────────┘                   │ │
│                                         │ │
│  ┌─────────────────────────────────────┐│ │
│  │  对象存储 (阿里云OSS/腾讯云COS)      ││ │
│  │  - 图片资源                          ││ │
│  │  - 视频资源                          ││ │
│  │  - 导出成片                          ││ │
│  └─────────────────────────────────────┘│ │
└─────────────────────────────────────────┘ │
```

---

## 四、冲突解决策略

### 4.1 最后写入获胜 (Last-Write-Wins)
```typescript
function resolveConflict(local: Project, remote: Project): Project {
  return local.updatedAt > remote.updatedAt ? local : remote;
}
```

### 4.2 三路合并 (Three-Way Merge)
```typescript
function threeWayMerge(base: Project, local: Project, remote: Project): Project {
  // 对比 base -> local 和 base -> remote 的差异
  // 合并非冲突的变更
  // 标记冲突字段供用户解决
}
```

### 4.3 操作转换 (Operational Transformation)
```typescript
// 适用于实时协作
function transformOps(localOp: Operation, remoteOp: Operation): Operation {
  // 调整操作顺序，确保一致性
}
```

---

## 五、推荐技术栈

### 5.1 短期（1-2 个月）
| 组件 | 技术 | 说明 |
|------|------|------|
| 本地存储 | localStorage + IndexedDB | 快速实现 |
| 文件导出 | File System Access API | 浏览器原生文件操作 |
| 数据格式 | JSON | 简单易用 |

### 5.2 中期（3-6 个月）
| 组件 | 技术 | 说明 |
|------|------|------|
| 云端同步 | WebDAV (坚果云) | 国内可用、成本低 |
| 资源存储 | 阿里云 OSS | CDN 加速 |
| 离线缓存 | localForage | 统一的离线存储 API |
| 冲突处理 | 时间戳策略 | 简单有效 |

### 5.3 长期（6+ 个月）
| 组件 | 技术 | 说明 |
|------|------|------|
| 后端服务 | Node.js + PostgreSQL | 稳定可靠 |
| 实时同步 | WebSocket / SSE | 即时更新 |
| 协作编辑 | CRDT / OT | 算法支持 |
| 媒体处理 | FFmpeg WASM | 浏览器端处理 |

---

## 六、实施建议

### Phase 1: 基础持久化
- [x] 项目数据本地存储（localStorage/IndexedDB）
- [ ] 项目导出/导入功能
- [ ] 自动保存机制

### Phase 2: 云端备份
- [ ] 集成坚果云 WebDAV
- [ ] 手动同步按钮
- [ ] 同步状态指示器

### Phase 3: 自动同步
- [ ] 实时同步（基于变更检测）
- [ ] 离线编辑支持
- [ ] 冲突解决 UI

### Phase 4: 协作功能
- [ ] 多用户实时协作
- [ ] 评论和批注
- [ ] 版本历史浏览器

---

## 七、参考资源

### 开源项目
- [isomorphic-git](https://isomorphic-git.org/) - 浏览器端 Git
- [webdav-client](https://github.com/perry-mitchell/webdav-client) - WebDAV 客户端
- [localForage](https://localforage.github.io/localForage/) - 离线存储
- [yjs](https://github.com/yjs/yjs) - CRDT 协作编辑框架

### 文档
- [WebDAV RFC 4918](https://tools.ietf.org/html/rfc4918)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**最后更新：** 2026-03-10

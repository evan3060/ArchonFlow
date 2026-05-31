# ArchonFlow

**多 Agent 全栈交付流水线** — 一个项目无关的多 Agent 治理体系，通过认知隔离和契约驱动开发，强制执行设计保真、API 合规和代码质量。

[English Documentation](./README.md)

---

## 问题

AI 编码代理能写代码，但它们不知道什么叫"写对了"。存在两个世界：

- **设计真相** — 设计师的意图（来自 Figma、Stitch、v0 等）
- **代码真相** — AI 实际实现的结果

这两个世界天然存在偏差。AI 模型会向统计上的"常见值"漂移：用 `12px` 圆角代替 `32px`，用 `#ffffff` 代替 `#f9f9ff`，用系统字体代替指定字体。这些偏差不会报错，但用户一眼就能看出来。

后端 API 也存在同样的问题——契约写好了，但实现偏离了规范。

**ArchonFlow 通过隔离的专业 Agent 让设计意图和 API 契约变得机器可验证，从而弥合这些鸿沟。**

---

## 核心思路

```
设计导出（任何工具）
        ↓
  ┌─ 契约阶段 ─────────────────────────────────────────────┐
  │  System Architect     ← 架构、模块、路由                  │
  │  Design Authority     ← 解释设计 → 生成契约               │
  │  Contract Generator   ← 提取设计 Token                    │
  │  API Architect        ← 设计 API 契约                     │
  │  Mock Server Generator← 创建确定性 Mock 数据              │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ 前端构建 ──────────────────────────────────────────────┐
  │  Frontend Engineer    ← 仅按契约实现                       │
  │  Visual Auditor       ← Playwright + 截图差异（门控）      │
  │  UX Compliance        ← 交互与无障碍（门控）               │
  │  Code Reviewer        ← 代码质量（门控）                   │
  │  (修复循环: 评分 < 95 → 修复 → 重新审计)                  │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ 后端构建 ──────────────────────────────────────────────┐
  │  Backend Engineer     ← 实现 API 契约层                   │
  │  Integration Checker  ← API 合规测试                      │
  │  Code Reviewer        ← 代码质量（门控）                   │
  │  (修复循环: 评分 < 90 → 修复 → 重新测试)                  │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ 联调验收 ──────────────────────────────────────────────┐
  │  Integration Checker  ← 全栈 API 验证                     │
  │  Visual Auditor       ← 端到端视觉验证                    │
  │  UX Compliance        ← 端到端 UX 验证                    │
  │  Code Reviewer        ← 最终质量门控                      │
  └──────────────────────────────────────────────────────────┘
        ↓
  发布
```

---

## "禁止发明"规则

这是框架中最关键的规则：

> **如果设计契约没有规定某项内容，前端工程师绝不能自行发明。工程师必须停下来，向 Design Authority 请求澄清。**

这条规则的存在是为了对抗 AI 向"常见值"的统计漂移：

| 契约规定 | AI 通常生成 | 原因 |
|---------|-----------|------|
| `border-radius: 32px` | `border-radius: 12px` | 12px 在训练数据中更常见 |
| `#f9f9ff` | `#ffffff` | 纯白是默认值 |
| 指定字体 | 系统字体 | 系统字体是后备方案 |
| 自定义导航 | 标准导航 | 标准模式更常见 |

同样的原则适用于后端：**如果 API 契约规定了响应 Schema，后端工程师绝不能偏离它。**

---

## 设计源模式

ArchonFlow 支持两种模式，在立项阶段决定：

### 模式 A：外部设计（推荐）

你有来自 Figma、Stitch、v0 等工具的设计导出。

- 完整流水线：视觉审计 + UX 合规 + 代码审查
- 视觉评分 ≥ 95 才能发布
- 将导出放在 `design-references/`

### 模式 B：默认设计（无外部设计）

没有设计工具导出。你描述页面结构。

- 简化流水线：仅代码审查（无视觉/UX 审计）
- Design Authority 根据你的描述生成结构化契约
- 侧重功能正确性，而非视觉保真

---

## 流水线技能

| 技能 | 命令 | 功能 |
|------|------|------|
| 立项 | `/proposal` | 苏格拉底式问答 → 项目简报、设计源决策 |
| 契约 | `/contract <target>` | 生成所有契约（设计 + API + Mock 数据） |
| 前端构建 | `/frontend-building <target>` | 实现 UI + 视觉审计 + UX 审计 + 代码审查 |
| 后端构建 | `/backend-building <target>` | 实现 API + 合规测试 + 代码审查 |
| 联调验收 | `/integration-audit <target>` | 全栈集成验证 |
| 状态 | `/status` | 查看流水线进度和评分 |

---

## Agent 委员会 — 12 个 Agent

### 契约阶段

| Agent | 角色 | 能看到 | 永远看不到 |
|-------|------|--------|-----------|
| System Architect | 架构设计 | contracts, src/ | design-references/ |
| Design Authority | 设计解释 | design-references, contracts | src/ |
| Contract Generator | Token 提取 | contracts | src/, design-references/ |
| API Architect | API 契约设计 | contracts | src/, design-references/ |
| Mock Server Generator | Mock 数据创建 | contracts | src/, design-references/ |

### 前端阶段

| Agent | 角色 | 能看到 | 永远看不到 |
|-------|------|--------|-----------|
| Design System Guardian | Token 维护 | contracts, tokens | components, pages |
| Frontend Engineer | UI 实现 | contracts, tokens, src, audits | design-references/ |
| Visual Auditor | 视觉保真 | contracts, 运行中的应用 | **src/** |
| UX Compliance | 交互检查 | contracts, 运行中的应用 | **src/** |
| Code Reviewer | 代码质量 | src/ | contracts, audits |

### 后端阶段

| Agent | 角色 | 能看到 | 永远看不到 |
|-------|------|--------|-----------|
| Backend Engineer | API 实现 | contracts, mock, audits | design-references/, 前端 src/ |
| Integration Checker | API 合规 | contracts, 运行中的服务器 | **src/** |

---

## 认知隔离

这是 ArchonFlow 与"只是用多个 prompt"的关键区别：

> **Agent 隔离 ≠ Prompt 隔离**
>
> Agent 隔离 = **认知隔离** + 权限隔离 + 上下文隔离

大多数 AI 编码团队这样做：

```
前端 Agent  ─┐
后端 Agent  ─┤── 同一上下文、同一仓库、同一认知
QA Agent    ─┘
```

本质上是一个模型换三个名字——没有真正的制衡。

ArchonFlow 通过 Claude Code 原生 Subagent 系统强制执行**认知隔离**：

**Subagent 如何提供真正的隔离：**

每次 `@agent-name` 调用会生成一个**新的 subagent**，拥有：
- 独立的上下文窗口（与其他 Agent 没有共享记忆）
- 受限的工具（审计者没有 Write/Edit——它们物理上无法修改代码）
- 独立的系统提示（从 Agent 的 .md 定义加载）

**为什么 Visual Auditor 绝不能看到源代码：**

如果审计者看到代码里写着 `border-radius: 16px`，它会产生认知偏差：*"也许开发者故意这么设计的。"* 没有源代码访问，审计者只能将**看到的东西**（截图、DOM）与契约对比——和真实用户完全一样。

**为什么 Integration Checker 绝不能看到源代码：**

同样的原则。它从外部测试 API，像真实客户端一样。它不会因为看到后端实现方式而受到影响——只关心 API 是否按契约行为。

**为什么前端工程师绝不能看到设计导出：**

如果工程师看到原始设计文件，他们会"直接抄"而不是遵循契约。契约的存在是为了消除歧义——绕过它就失去了意义。

---

## Subagent 架构

ArchonFlow 使用 Claude Code 原生 Subagent 系统。每个 Agent 在 `agents/*.md` 中定义，包含 YAML frontmatter 控制工具、模型和权限。

### 安装

无需安装。将 agents 和 skills 复制到你项目的
`.claude/` 目录中——Claude Code 启动时自动发现。

```
your-project/.claude/
├── agents/             ← Subagent 定义（自动发现）
│   ├── visual-auditor.md
│   └── ...
└── skills/             ← 流水线技能（自动发现）
    ├── contract/SKILL.md
    └── ...
```

只需复制即可开始使用 `/proposal` 或任何技能。

### 工作原理

当 Skill 调用 `@agent-name` 时：
1. Claude Code 生成一个**新的 subagent**，拥有独立的上下文窗口
2. Subagent 加载其 .md 定义（工具、规则、任务）
3. 它在隔离中工作——无法看到范围外的文件
4. 它将结果返回给父对话
5. 父对话调用下一个 subagent

### Agent 工具权限

| Agent | 工具 | 可写？ | 关键限制 |
|-------|------|--------|---------|
| system-architect | Read, Grep, Glob, LS | ❌ | 只读，不实现 |
| design-authority | Read, Grep, Glob, LS | ❌ | 只读，不实现 |
| contract-generator | Read, Grep, Glob | ❌ | 只读，不实现 |
| api-architect | Read, Grep, Glob | ❌ | 只读，不实现 |
| mock-server-generator | Read, Grep, Glob, Write | ✅ mock/ | 只写 mock 数据 |
| design-system-guardian | Read, Grep, Glob, Write, Edit | ✅ tokens/ | 只写 token |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | 完整开发工具 |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | 完整开发工具 |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit——无法修改代码** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit——无法修改代码** |
| integration-checker | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit——无法修改代码** |
| code-reviewer | Read, Grep, Glob | ❌ | **只读——仅审查** |

### Agent Team 模式（实验性）

对于并行执行（如同时构建多个页面），你可以请求 Agent Teams：

```
使用 team agents 并行构建 analysis、growth 和 knowledge 页面
```

这会在 tmux 面板中生成多个 Claude Code 实例，每个独立运行完整的前端构建流水线。需要启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`。

---

## 设计契约

设计契约是体系的**宪法性文件**。它不是随意的描述——它是所有 Agent 必须遵守的可执行规范。

### 为什么需要契约？

没有契约时，每个 Agent 对设计导出的理解都不同。契约消除了歧义，成为唯一的权威解释。

### 契约结构

```markdown
# {页面名称} 设计契约

## 元数据
- 版本、时间戳、设计来源、状态

## 使用的 Token
- 每个颜色、间距、圆角、字体、阴影的引用

## 页面结构
- 容器规范 → 区域规范 → 组件规范 → 元素规范
- 每个视觉属性包含精确值和 Token 引用

## 交互状态
- 每个交互元素：默认、悬停、聚焦、激活、禁用

## 响应式行为
- 移动端 / 平板 / 桌面断点和适配

## 待澄清项
- 设计导出中未明确规定的任何内容（标记而非猜测）
```

---

## API 契约

API 契约定义了前后端之间的约定。它规定了：

- 端点路径、方法、请求/响应 Schema
- 状态码和错误响应格式
- 分页、过滤、排序约定
- 数据关系和依赖

后端工程师仅实现契约层。范围外的项目（数据库、认证、业务逻辑）使用 TODO 存根，并在 `api-todo.md` 中跟踪。

Mock Server Generator 从 API 契约创建确定性 Mock 数据，使前端开发可以独立进行。

---

## 评分体系

### 视觉审计评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| 颜色保真 | 25% | 所有颜色匹配契约（CIEDE2000） |
| 排版保真 | 20% | 字体族、字号、字重匹配 |
| 间距保真 | 20% | 内边距、外边距、间隙匹配 |
| 圆角保真 | 15% | border-radius 匹配 |
| 布局保真 | 15% | 结构、对齐、定位 |
| 阴影保真 | 5% | box-shadow 匹配 |

### API 合规评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| Schema 合规 | 40% | 响应匹配契约 Schema |
| 状态码准确 | 20% | HTTP 状态码匹配契约 |
| 边界处理 | 20% | 空数据、错误、分页 |
| 数据完整性 | 20% | CRUD 操作产生正确数据 |

### 评判标准

| 评分 | 判定 | 行动 |
|------|------|------|
| 95–100（视觉）/ 90–100（API） | ✅ 通过 | 进入下一阶段 |
| 85–94（视觉）/ 80–89（API） | ⚠️ 需修复 | 工程师修复后重新审计 |
| <85（视觉）/ <80（API） | ❌ 驳回 | 从契约重新实现 |

### 颜色对比：CIEDE2000

我们使用 CIEDE2000（而非简单 RGB 距离）进行感知准确的色差比较：
- ΔE00 < 2：人眼不可感知
- ΔE00 2–5：轻微差异
- ΔE00 > 5：可见差异

---

## 修复循环

当审计评分低于阈值时，系统自动进入修复循环：

```
审计者（评分 < 阈值）
    ↓
工程师（阅读审计报告 + 记忆 + 契约，修复问题）
    ↓
更新 Agent 记忆文件
    ↓
审计者（全新 subagent，但携带记忆，重新审计）
    ↓
如果评分 ≥ 阈值 → 通过 → 进入下一个审计阶段
如果评分 < 阈值 → 再次循环（每个阶段最多 3 次）
如果达到最大次数 → 停止并输出失败报告
```

**强制规则：**
- 每个审计阶段必须通过后才能进入下一阶段
- 视觉审计必须通过 → UX 合规 → 代码审查
- 集成测试必须通过 → 代码审查
- 修复后必须重新审计——始终验证
- 不要询问用户是否修复——直接修复
- 所有阶段通过后才能生成最终报告

### Agent 记忆

每个 Agent 在 `archonflow/memory/{agent-name}.md` 维护记忆文件。
这确保了修复迭代间的连续性——当同一个 Agent 被再次调用时，
它会收到之前的工作历史作为上下文：

- 之前迭代做了什么
- 关键决策
- 修改了哪些文件
- 遇到的问题
- 待修复项

这解决了"全新 subagent"问题：即使 Claude Code 每次生成新的 subagent，
记忆文件也保留了 Agent 的上下文。

---

## 项目结构

**插件安装**会自动将 `agents/` 和 `skills/` 复制到 `.claude/` 目录。
你只需将 `config/`、`templates/`、`scripts/` 复制到 `archonflow/`。

```bash
# /plugin install archonflow 之后，复制运行时文件：
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

复制后，你的项目结构如下：

```
your-project/
├── .claude/                  ← Claude Code 从这里自动发现
│   ├── agents/                      # 12 个 subagent 定义
│   │   ├── system-architect.md
│   │   ├── visual-auditor.md
│   │   └── ...
│   └── skills/                      # 6 个流水线技能
│       ├── proposal/SKILL.md
│       ├── contract/SKILL.md
│       └── ...
├── archonflow/               ← 所有 ArchonFlow 文件集中存放
│   ├── config/                      # 项目配置
│   │   ├── project.config.json      # ← 编辑这个文件配置项目
│   │   └── scoring-criteria.json
│   ├── templates/                   # 报告和契约模板
│   ├── scripts/                     # Playwright 截图、视觉差异、评分计算
│   ├── contracts/                   # 生成的契约（自动创建）
│   ├── audits/                      # 审计报告（自动创建）
│   ├── ux-reports/                  # UX 合规报告（自动创建）
│   ├── reports/                     # 代码审查和最终报告（自动创建）
│   ├── mock/                        # 生成的 Mock 数据（自动创建）
│   └── memory/                      # Agent 记忆文件（自动创建）
├── src/                      ← 你现有的源代码（不受影响）
└── ... (你现有的项目文件，不受影响)
```

设计文件**自动发现** — 无论放在项目哪里，proposal 技能都会找到它们。无需移动或重命名。

---

## 快速开始

### 1. 安装插件

在 Claude Code 中，注册 marketplace 并安装：

```bash
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
```

或从官方 marketplace 安装（如果已发布）：

```bash
/plugin install archonflow@claude-plugins-official
```

这会自动将 agents 和 skills 复制到你项目的 `.claude/` 目录中。
然后将运行时文件复制到 `archonflow/`：

```bash
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

### 手动安装

如果你更愿意手动设置，克隆仓库后复制：

```bash
# 克隆并复制：
git clone https://github.com/evan3060/ArchonFlow.git /tmp/archonflow
cp -r /tmp/archonflow/agents .claude/agents
cp -r /tmp/archonflow/skills .claude/skills
mkdir -p archonflow
cp -r /tmp/archonflow/config archonflow/config
cp -r /tmp/archonflow/templates archonflow/templates
cp -r /tmp/archonflow/scripts archonflow/scripts
```

所有规则已自包含在每个 SKILL.md 中。
不会与你现有的 `.claude/` 设置冲突。

### 2. 配置

编辑 `archonflow/config/project.config.json`，填入项目信息：

- **项目身份** — 名称、技术栈（Vue、React 等）
- **后端技术** — 框架、语言、源码目录
- **设计来源** — 工具类型（Figma、Stitch、v0 等）、导出格式
- **目录约定** — 映射到现有源码结构
- **评分阈值** — 自定义通过/修复/驳回阈值
- **视口设置** — 目标设备和断点
- **Agent 覆盖** — 项目专属的 Agent 规则

### 3. 添加设计导出

设计文件自动发现 — 放在项目任何位置即可。
无需指定目录。

### 4. 运行流水线

```bash
# 第 1 步：创建项目立项（交互式）
/proposal

# 第 2 步：生成所有契约
/contract analysis

# 第 3 步：构建前端（含视觉审计）
/frontend-building analysis

# 第 4 步：构建后端（含 API 合规）
/backend-building analysis

# 第 5 步：联调验收
/integration-audit analysis

# 随时查看状态
/status
```

---

## 设计哲学

### 为什么叫 "Design Authority" 而不是 "Design Architect"？

这个名字反映了角色的真正职责：**最终解释权**，而不仅仅是架构。当 Agent 之间对设计含义产生分歧时，Design Authority 拥有最终裁决权。这与"契约即法律"的原则对齐——宪法需要宪法法院来解释。

### 为什么不绑定具体设计工具？

设计工具会变。今天是 Stitch，明天是 Figma，明年可能是新工具。框架服务于**设计意图**，而非具体工具。Design Authority 接受任何设计源的输入，产出同样结构化的契约。

### 为什么分离 Visual Auditor 和 UX Compliance？

Visual Auditor 检查事物**看起来**对不对。UX Compliance 检查事物**用起来**对不对。一个按钮可以有正确的默认颜色，但缺少 hover/focus/disabled 状态。这是不同的失效模式，需要不同的专业能力。

### 为什么后端只实现 API 契约层？

完整的后端实现（数据库、认证、业务逻辑）需要人类判断和领域专业知识。流水线实现**契约层**——路由、控制器、请求/响应格式化——确保 API 表面与契约匹配。其余内容在 `api-todo.md` 中跟踪，供手动完成。

### 为什么 Mock Server 是标配？

Mock 数据实现**并行开发**：前端基于 Mock 构建，同时后端实现真实 API。当两者都准备好时，联调验收验证它们是否匹配。这消除了"等后端"的瓶颈。

### 为什么用 CIEDE2000 做颜色对比？

简单的 RGB 距离把所有色差等同对待，但人眼感知并非如此。CIEDE2000 考虑了感知均匀性——ΔE00 < 1 的差异对人眼不可感知，无论是什么颜色对。

---

## 许可证

MIT

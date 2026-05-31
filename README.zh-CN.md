# ArchonFlow

**多 Agent 全栈交付流水线** — 一个项目无关的多 Agent 治理体系，集成 TDD、Change-Based 架构和两阶段审查。通过认知隔离和契约驱动开发，强制执行设计保真、API 合规和代码质量。

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
  ┌─ /proposal ────────────────────────────────────────────┐
  │  上下文探测           ← 全新项目 vs 增量功能              │
  │  需求澄清             ← 苏格拉底式问答                    │
  │  方案提议             ← 2-3 个选项及权衡                   │
  │  规格生成             ← 提案文档                          │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /design ──────────────────────────────────────────────┐
  │  System Architect     ← 架构、模块、路由                  │
  │  Design Authority     ← 解释设计 → 生成契约               │
  │  Contract Generator   ← 设计契约（Given/When/Then）       │
  │  Data Architect       ← 数据库模式、迁移计划               │
  │  API Architect        ← API 契约（Given/When/Then）       │
  │  Design System Guardian← Token 提取与验证                 │
  │  Mock Server Generator← 确定性 Mock 数据                  │
  │  实现计划             ← 微任务分解                        │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /build ───────────────────────────────────────────────┐
  │  Backend Engineer     ← 数据层 + API（TDD）              │
  │  Frontend Engineer    ← UI 实现（TDD）                   │
  │  集成连接             ← 前端 ↔ 后端对接                   │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /verify ──────────────────────────────────────────────┐
  │  第一阶段：规格合规                                     │
  │    Visual Auditor      ← 视觉保真（≥95）                 │
  │    API Compliance      ← API 契约匹配（≥95）             │
  │    UX Compliance       ← 交互与无障碍（≥90）             │
  │    Integration Checker ← 前后端集成（≥90）               │
  │  第二阶段：代码质量                                     │
  │    Backend Auditor     ← 安全、性能、数据（≥85）          │
  │    Code Reviewer       ← 代码质量与模式（≥85）           │
  │  修复循环: 不通过 → 修复 → 重新审计（最多3次迭代）        │
  └──────────────────────────────────────────────────────────┘
        ↓
  发布
```

---

## v0.2 新特性

| 特性 | 说明 |
|------|------|
| **TDD 纪律** | 所有实现强制遵循 RED-GREEN-REFACTOR |
| **Change-Based 架构** | 每个功能/修复作为独立 Change 文件夹 |
| **两阶段审查** | 先审规格合规，再审代码质量 |
| **三维度验收** | 完整性、正确性、一致性 |
| **行为规格** | Given/When/Then 格式定义所有交互 |
| **API 合规 Agent** | 专门的 API 契约合规审计 |
| **后端审计 Agent** | 安全、性能、数据完整性审计 |
| **数据架构 Agent** | 数据库模式和迁移设计 |
| **统一流水线** | `/proposal → /design → /build → /verify → /fix → /status` |
| **Agent 记忆** | 持久化记忆文件，确保迭代连续性 |

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
- 关注功能正确性，而非视觉保真

---

## 流水线技能

| 技能 | 命令 | 功能 |
|------|------|------|
| 提案 | `/proposal` | 上下文感知问答 → 提案规格（全新/增量） |
| 设计 | `/design` | 生成设计契约、API 契约、数据层、计划 |
| 构建 | `/build` | TDD 实现（数据 → 后端 → 前端） |
| 验证 | `/verify` | 三维度审计 + 两阶段审查 |
| 修复 | `/fix "<描述>"` | 定向 Bug 修复 + 审计验证 |
| 状态 | `/status` | 显示流水线进度、评分、变更日志 |

---

## Agent 委员会 — 15 个 Agent

### 设计阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| System Architect | 架构设计 | 契约, src/ | design-references/ |
| Design Authority | 设计解释 | design-references, 契约 | src/ |
| Contract Generator | 设计契约（Given/When/Then） | 契约 | src/, design-references/ |
| Data Architect | 数据库模式与迁移 | 契约 | src/, design-references/ |
| API Architect | API 契约（Given/When/Then） | 契约 | src/, design-references/ |
| Mock Server Generator | Mock 数据创建 | 契约 | src/, design-references/ |
| Design System Guardian | Token 维护 | 契约, tokens | components, pages |

### 构建阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| Frontend Engineer | UI 实现（TDD） | 契约, tokens, src, 审计 | design-references/ |
| Backend Engineer | API 实现（TDD） | 契约, mock, 审计 | design-references/, 前端 src/ |

### 验证阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| Visual Auditor | 视觉保真 | 契约, 运行中应用 | **src/** |
| API Compliance | API 契约匹配 | 契约, 运行中应用 | **src/** |
| UX Compliance | 交互与无障碍 | 契约, 运行中应用 | **src/** |
| Integration Checker | 前后端集成 | 契约, 运行中服务 | **src/** |
| Backend Auditor | 安全、性能、数据 | src/, 契约 | — |
| Code Reviewer | 代码质量 | src/, 契约 | — |

---

## 认知隔离

这是 ArchonFlow 区别于"只是用多个提示词"的关键洞察：

> **Agent 隔离 ≠ 提示词隔离**
>
> Agent 隔离 = **认知隔离** + 权限隔离 + 上下文隔离

大多数 AI 编码团队这样做：

```
前端 Agent  ─┐
后端 Agent  ─┤── 同一上下文，同一仓库，同一认知
QA Agent    ─┘
```

那只是一个模型起了三个名字——没有真正的制衡。

ArchonFlow 通过 Claude Code 原生 Subagent 系统实现**认知隔离**：

**Subagent 如何提供真正的隔离：**

每次 `@agent-name` 调用会生成一个**新的子代理**，具有：
- 独立的上下文窗口（不与其他 Agent 共享记忆）
- 受限的工具（审计类 Agent 没有 Write/Edit——它们物理上无法修改代码）
- 独立的系统提示（从 Agent 的 .md 定义加载）

**为什么 Visual Auditor 绝不能看到源代码：**

如果审计者看到代码中的 `border-radius: 16px`，会产生认知偏见："也许开发者就是想要这个。"没有源代码访问权限，审计者只能将**看到的**（截图、DOM）与契约对比——就像真实用户一样。

**为什么 Integration Checker 绝不能看到源代码：**

同样的原则。它从外部测试 API，就像真实客户端一样。它不会被后端实现方式所影响——只关心 API 是否按契约运行。

**为什么 Frontend Engineer 绝不能看到设计导出：**

如果工程师看到原始设计文件，他们会"直接照抄"而不是遵循契约。契约的存在是为了消除歧义——绕过它就失去了意义。

---

## Subagent 架构

ArchonFlow 使用 Claude Code 原生 Subagent 系统。每个 Agent 在 `agents/*.md` 中定义，包含控制工具、模型和权限的 YAML frontmatter。

### 设置

无需设置。将 agents 和 skills 复制到项目的 `.claude/` 目录——Claude Code 启动时自动发现。

```
your-project/.claude/
├── agents/             ← Subagent 定义（自动发现）
│   ├── visual-auditor.md
│   └── ...
└── skills/             ← 流水线技能（自动发现）
    ├── proposal/SKILL.md
    └── ...
```

复制后即可使用 `/proposal` 或任何技能。

### 工作原理

当技能调用 `@agent-name` 时：
1. Claude Code 生成一个**新的子代理**，拥有独立上下文窗口
2. 子代理加载其 .md 定义（工具、规则、使命）
3. 在隔离中工作——无法看到范围外的文件
4. 将结果返回给父对话
5. 父对话调用下一个子代理

### Agent 工具权限

| Agent | 工具 | 可写？ | 关键限制 |
|-------|------|--------|---------|
| system-architect | Read, Grep, Glob, LS | ❌ | 只读 |
| design-authority | Read, Grep, Glob, LS | ❌ | 只读 |
| contract-generator | Read, Grep, Glob | ❌ | 只读 |
| data-architect | Read, Grep, Glob | ❌ | 只读 |
| api-architect | Read, Grep, Glob | ❌ | 只读 |
| mock-server-generator | Read, Grep, Glob, Write | ✅ mock/ | 仅写 mock 数据 |
| design-system-guardian | Read, Grep, Glob, Write, Edit | ✅ tokens/ | 仅写 tokens |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | 完整开发工具 |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | 完整开发工具 |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| api-compliance | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| integration-checker | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| backend-auditor | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| code-reviewer | Read, Grep, Glob | ❌ | **只读** |

### Agent Team 模式（实验性）

对于并行执行（如同时构建多个页面），可以请求 Agent Teams：

```
Use team agents for archonflow:build
```

这会在 tmux 面板中生成多个 Claude Code 实例，每个独立运行。需要启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`。

---

## TDD 纪律（强制）

所有实现 Agent 遵循 RED-GREEN-REFACTOR：

1. **RED** — 写一个描述预期行为的失败测试
2. **验证 RED** — 运行测试，确认因正确原因失败
3. **GREEN** — 写最少的代码让测试通过
4. **验证 GREEN** — 运行测试确认通过；运行所有测试确认无回归
5. **REFACTOR** — 在保持所有测试通过的前提下清理代码
6. **重复** — 进入下一个微任务

**如果你在写测试之前写了代码：删除代码，从测试开始。**

---

## Change-Based 架构

每个功能或修复作为独立 Change 追踪：

```
archonflow/changes/{change-name}/
├── proposal.md      ← 需求规格
├── analysis.md      ← 结构分析
├── design.md        ← 设计契约（Given/When/Then）
├── api.md           ← API 契约（Given/When/Then）
├── data.md          ← 数据层契约
├── plan.md          ← 实现计划（微任务）
├── verify-report.md ← 验证结果
└── fix-report.md    ← Bug 修复结果（如有）
```

当 Change 通过验证后，归档到 `archonflow/specs/`。

`archonflow/changelog.md` 追踪所有 Change 的状态进展：
📋 已提议 → 🎨 已设计 → 🔨 已构建 → ✅ 已验证

---

## 两阶段审查

### 第一阶段：规格合规（完整性 + 正确性）

审计者从**外部**测试——它们从不读取源代码。

1. @visual-auditor — 视觉合规 vs 设计契约
2. @api-compliance — API 合规 vs API 契约
3. @ux-compliance — UX 合规 vs 设计契约
4. @integration-checker — 前后端集成

全部通过后才能进入第二阶段。

### 第二阶段：代码质量（一致性）

审查者读取源代码评估质量。

5. @backend-auditor — 后端安全、性能、数据完整性
6. @code-reviewer — 代码质量、模式、测试覆盖

---

## 行为规格（Given/When/Then）

所有契约使用 Given/When/Then 格式定义行为规格：

```markdown
### 需求：登录按钮点击
系统应当在登录成功后导航到仪表盘。

#### 场景：有效凭证
- GIVEN 用户在登录页面
- WHEN 用户输入有效凭证并点击"登录"
- THEN 系统导航到仪表盘
- AND 用户会话已建立
```

使用 RFC 2119 关键词：SHALL（强制）、MUST（绝对）、SHOULD（推荐）、MAY（可选）。

---

## 评分系统

### 视觉审计评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| 颜色保真 | 25% | 所有颜色匹配契约（CIEDE2000） |
| 排版保真 | 20% | 字体族、大小、粗细匹配 |
| 间距保真 | 20% | 内边距、外边距、间隙匹配 |
| 圆角保真 | 15% | border-radius 匹配 |
| 布局保真 | 15% | 结构、对齐、定位 |
| 阴影保真 | 5% | box-shadow 匹配 |

### API 合规评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| Schema 合规 | 35% | 响应匹配契约 Schema |
| 状态码准确性 | 20% | HTTP 状态码匹配契约 |
| 错误格式 | 15% | 统一错误格式合规 |
| 认证 | 15% | 认证/授权按规范执行 |
| 向后兼容 | 15% | 不破坏现有 API |

### 后端审计评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| 安全性 | 30% | SQL 注入、XSS、CSRF、认证绕过 |
| 性能 | 25% | N+1 查询、缺失索引、分页 |
| 数据完整性 | 25% | 约束、验证、级联 |
| 错误处理 | 20% | 错误格式、日志、恢复 |

### 阈值

| 审计者 | 通过阈值 |
|--------|---------|
| Visual Auditor | ≥ 95 |
| API Compliance | ≥ 95 |
| UX Compliance | ≥ 90 |
| Integration Checker | ≥ 90 |
| Backend Auditor | ≥ 85 |
| Code Reviewer | ≥ 85 |

### 颜色比较：CIEDE2000

我们使用 CIEDE2000（而非简单 RGB 距离）进行感知准确的色彩比较：
- ΔE00 < 2：人眼不可察觉
- ΔE00 2–5：轻微差异
- ΔE00 > 5：可见差异

---

## 修复循环

当审计评分低于阈值时，系统自动进入修复循环：

```
审计者（评分 < 阈值）
    ↓
工程师（读取审计报告 + 记忆 + 契约，修复问题）
    ↓
更新 Agent 记忆文件
    ↓
审计者（新子代理，但有记忆，重新审计）
    ↓
如果评分 ≥ 阈值 → 通过 → 进入下一审计阶段
如果评分 < 阈值 → 再次循环（每阶段最多3次迭代）
如果达到最大迭代 → 停止并输出失败报告
```

**强制规则：**
- 每个审计阶段必须通过后才能进入下一阶段
- 第一阶段（规格合规）必须全部通过后才能进入第二阶段（代码质量）
- 修复后绝不能跳过重新审计——必须验证
- 绝不能询问用户是否修复——直接修复
- 所有阶段通过后才能生成最终报告

### Agent 记忆

每个 Agent 维护一个记忆文件 `archonflow/memory/{agent-name}.md`。
这确保了修复迭代的连续性——当同一 Agent 被重新调用时，它会收到之前的工作历史作为上下文：

- 之前迭代做了什么
- 做了哪些关键决策
- 修改了哪些文件
- 遇到了什么问题
- 待修复的问题

这解决了"新子代理"问题：即使 Claude Code 每次生成新的子代理，记忆文件也保留了 Agent 的上下文。

---

## 项目结构

**插件安装**会自动将 `agents/` 和 `skills/` 复制到 `.claude/`。
你只需将 `config/`、`templates/`、`scripts/` 复制到 `archonflow/`。

```bash
# /plugin install archonflow 后，复制运行时文件：
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

复制后，你的项目结构如下：

```
your-project/
├── .claude/                  ← Claude Code 从这里自动发现
│   ├── agents/                      # 15 个 subagent 定义
│   │   ├── system-architect.md
│   │   ├── visual-auditor.md
│   │   ├── api-compliance.md
│   │   ├── backend-auditor.md
│   │   ├── data-architect.md
│   │   └── ...
│   └── skills/                      # 6 个流水线技能
│       ├── proposal/SKILL.md
│       ├── design/SKILL.md
│       ├── build/SKILL.md
│       ├── verify/SKILL.md
│       ├── fix/SKILL.md
│       └── status/SKILL.md
├── archonflow/               ← 所有 ArchonFlow 文件集中存放
│   ├── config/                      # 项目配置
│   │   └── project.config.json      # ← 编辑此文件适配你的项目
│   ├── templates/                   # 报告和契约模板
│   ├── scripts/                     # Playwright 截图、视觉差异、评分
│   ├── changes/                     # Change-Based 追踪（自动创建）
│   │   └── {change-name}/           # 每个功能/修复一个文件夹
│   ├── specs/                       # 已归档的完成变更
│   ├── contracts/                   # 生成的契约（自动创建）
│   ├── audits/                      # 审计报告（自动创建）
│   ├── visual-reports/              # 视觉审计报告（自动创建）
│   ├── ux-reports/                  # UX 合规报告（自动创建）
│   ├── reports/                     # 代码审查和最终报告（自动创建）
│   ├── mock/                        # 生成的 Mock 数据（自动创建）
│   ├── memory/                      # Agent 记忆文件（自动创建）
│   └── changelog.md                 # 变更历史追踪器
├── src/                      ← 你现有的源代码（不受影响）
└── ... (你现有的项目文件，不受影响)
```

设计文件**自动发现**——无论放在项目哪个位置，proposal 技能都能找到。无需移动或重命名。

---

## 快速开始

### 1. 安装插件

在 Claude Code 中注册市场并安装：

```bash
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
```

这会自动将 agents 和 skills 复制到项目的 `.claude/` 目录。
然后将运行时文件复制到 `archonflow/`：

```bash
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

### 手动安装

如果你更喜欢手动设置，克隆仓库并复制：

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

所有规则都自包含在每个 SKILL.md 中。
这不会与你现有的 `.claude/` 设置冲突。

### 2. 配置

编辑 `archonflow/config/project.config.json`——填写你的项目详情：

- **项目标识** — 名称、技术栈（Vue、React 等）
- **后端技术** — 框架、语言、源目录
- **设计源** — 工具类型（Figma、Stitch、v0 等）、导出格式
- **目录约定** — 映射到你现有的源码结构
- **评分阈值** — 自定义通过/修复/拒绝阈值
- **视口设置** — 目标设备和断点
- **Agent 覆盖** — 项目特定的 Agent 规则

### 3. 添加设计导出

设计文件自动发现——放在项目任何位置即可。
无需指定目录。

### 4. 运行流水线

```bash
# 步骤 1：创建项目提案（交互式）
/proposal

# 步骤 2：生成所有契约和计划
/design

# 步骤 3：TDD 构建
/build

# 步骤 4：两阶段审查验证
/verify

# 随时查看状态
/status
```

### 5. 手动验收后修复 Bug

当你在手动测试中发现问题时：

```bash
# 任何类型的 Bug
/fix "首页卡片间距偏大，按钮颜色不对"
/fix "提交按钮没有 hover 效果"
/fix "点击记录卡片报错"
/fix "GET /api/records 返回 500 错误"
/fix "提交表单后接口报错，前端也没有错误提示"
```

---

## 设计哲学

### 为什么叫"Design Authority"而不是"Design Architect"？

这个名字反映了角色的真正目的：**最终解释权威**，而不仅仅是架构。当 Agent 们对设计的含义有分歧时，Design Authority 有最终决定权。这与"契约即法律"原则一致——宪法需要宪法法院来解释。

### 为什么不绑定特定设计工具？

设计工具会变。今天是 Stitch，明天是 Figma，明年可能是新工具。框架服务于**设计意图**，而非特定工具。Design Authority 接受任何设计源的输入，产出同样的结构化契约。

### 为什么区分 Visual Auditor 和 UX Compliance？

Visual Auditor 检查东西**看起来怎样**。UX Compliance 检查东西**行为怎样**。一个按钮可以有正确的默认颜色但缺少 hover/focus/disabled 状态。这是不同的失败模式，需要不同的专业知识。

### 为什么两阶段审查？

规格合规（是否匹配契约？）与代码质量（写得好不好？）本质上是不同的。一个完美编码但不符合设计的页面是错的。一个符合设计但有安全漏洞的页面也是错的。两者都需要检查，但标准不同。

### 为什么 TDD？

TDD 确保每个功能都有测试验证。修复循环运行时，测试防止回归。增量变更时，现有测试捕获破坏性变更。RED-GREEN-REFACTOR 循环也天然产生更好设计的代码。

### 为什么 Change-Based 架构？

每个变更是自包含且可追踪的。你可以看到功能从提案到验证的完整生命周期。增量变更互不干扰。出问题时，你确切知道是哪个变更导致的。

### 为什么后端只实现 API 契约层？

完整的后端实现（数据库、认证、业务逻辑）需要人类判断和领域专业知识。流水线实现**契约层**——路由、控制器、请求/响应格式化——确保 API 表面匹配契约。其余部分记录在 `api-todo.md` 中供手动完成。

### 为什么 Mock Server 是标配？

Mock 数据实现**并行开发**：前端基于 Mock 构建，后端同时实现真实 API。当两者都准备好时，集成审计验证它们匹配。这消除了"等后端"的瓶颈。

### 为什么颜色比较用 CIEDE2000？

简单 RGB 距离平等对待所有颜色差异，但人类感知并非如此。CIEDE2000 考虑了感知均匀性——ΔE00 < 1 的差异对人眼不可察觉，无论颜色对是什么。

---

## 许可证

MIT

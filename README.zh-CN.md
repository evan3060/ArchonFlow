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
  ┌─ /archonflow:proposal ─────────────────────────────────┐
  │  上下文探测           ← 全新项目 vs 增量功能              │
  │  需求澄清             ← 苏格拉底式问答                    │
  │  领域建模             ← 核心实体与关系                    │
  │  方案提议             ← 2-3 个选项及权衡                   │
  │  规格生成             ← 提案文档                          │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:design ────────────────────────────────────┐
  │  System Architect     ← 架构、模块、仲裁者               │
  │  Design Authority     ← 解释设计 → 生成契约 → 提取Token  │
  │  Data Architect       ← 数据库模式、迁移计划              │
  │  API Architect        ← API 契约 + Mock 数据             │
  │  假设日志             ← 记录实现细节假设                   │
  │  实现计划             ← 微任务分解                        │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:build ─────────────────────────────────────┐
  │  Backend Engineer     ← 数据层 + API（TDD）              │
  │  Frontend Engineer    ← UI 实现（TDD）                   │
  │  集成连接             ← 前端 ↔ 后端对接                   │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:verify ────────────────────────────────────┐
  │  第一阶段：规格合规                                     │
  │    Visual Auditor      ← 视觉保真（≥95）                 │
  │    API & Integration   ← API合规 + 集成测试（≥95）       │
  │    UX Compliance       ← 交互与无障碍（≥90）             │
  │  第二阶段：代码质量                                     │
  │    Code & Backend      ← 代码质量 + 后端审计（≥85）      │
  │  修复循环: 不通过 → 修复 → 重新审计（最多3次迭代）        │
  │  仲裁机制: System Architect 解决认知死锁                  │
  └──────────────────────────────────────────────────────────┘
        ↓
  发布
```

---

## v0.3 新特性

| 特性 | 说明 |
|------|------|
| **Agent 精简（15→10）** | 合并同视角 Agent，减少上下文切换，保持认知隔离 |
| **Design Authority（合并）** | 设计解释 + 契约生成 + Token 提取，一个 Agent 完成 |
| **API & Integration Auditor（合并）** | API 合规 + 集成测试统一为黑盒测试 |
| **Code & Backend Reviewer（合并）** | 代码质量 + 后端审计统一为白盒审查 |
| **API Architect + Mock（合并）** | API 契约设计 + Mock 数据生成一体化 |
| **Arbiter 仲裁机制** | System Architect 解决 Fix Loop 中的认知死锁 |
| **Assumption Log 假设日志** | 记录实现假设，分类为 REQUIRED/OPTIONAL/FORBIDDEN |
| **精准上下文注入** | 基于模块依赖图，仅向 Agent 注入相关文件 |
| **Git Reset 机制** | Fix Loop 前自动提交，失败时回滚到初始状态 |
| **算审分离** | 脚本计算色差/像素差异，LLM 仅负责解读结果 |
| **项目预设** | Enterprise/Normal/Internal 三档阈值预设 |
| **契约争议协议** | 构建 Agent 可质疑契约，Design Authority 最终裁决 |

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

不过，"禁止发明"规则通过 **Assumption Log** 得到了软化——工程师可以记录实现假设供后续审查，而不是在每个未指定的细节上阻塞。结构和视觉假设仍然严格禁止。

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
| 初始化 | `/archonflow:init` | 创建目录结构、复制运行时文件、配置项目 |
| 提案 | `/archonflow:proposal` | 上下文感知问答 → 提案规格（全新/增量） |
| 设计 | `/archonflow:design` | 生成设计契约、API 契约、数据层、计划 |
| 构建 | `/archonflow:build` | TDD 实现（数据 → 后端 → 前端） |
| 验证 | `/archonflow:verify` | 两阶段审计 + Fix Loop + Arbiter |
| 修复 | `/archonflow:fix "<描述>"` | 定向 Bug 修复 + 审计验证 |
| 状态 | `/archonflow:status` | 显示流水线进度、评分、变更日志 |

---

## Agent 委员会 — 10 个 Agent

### 设计阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| System Architect | 架构设计 + 仲裁者 | 契约, src/ | design-references/ |
| Design Authority | 解释 → 契约 → Token | design-references, 契约 | src/ |
| Data Architect | 数据库模式与迁移 | 契约 | src/, design-references/ |
| API Architect | API 契约 + Mock 数据 | 契约 | src/, design-references/ |

### 构建阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| Frontend Engineer | UI 实现（TDD） | 契约, tokens, src, 审计 | design-references/ |
| Backend Engineer | API 实现（TDD） | 契约, mock, 审计 | design-references/, 前端 src/ |

### 验证阶段

| Agent | 角色 | 可见 | 不可见 |
|-------|------|------|--------|
| Visual Auditor | 视觉保真 | 契约, 运行中应用 | **src/** |
| API & Integration Auditor | API 合规 + 集成测试 | 契约, 运行中应用 | **src/** |
| UX Compliance | 交互与无障碍 | 契约, 运行中应用 | **src/** |
| Code & Backend Reviewer | 代码质量 + 后端审计 | src/, 契约 | — |

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

**为什么 API & Integration Auditor 绝不能看到源代码：**

同样的原则。它从外部测试 API，就像真实客户端一样。它不会被后端实现方式所影响——只关心 API 是否按契约运行。

**为什么 Frontend Engineer 绝不能看到设计导出：**

如果工程师看到原始设计文件，他们会"直接照抄"而不是遵循契约。契约的存在是为了消除歧义——绕过它就失去了意义。

---

## Subagent 架构

ArchonFlow 使用 Claude Code 原生 Subagent 系统。每个 Agent 在 `agents/*.md` 中定义，包含控制工具、模型和权限的 YAML frontmatter。

### 设置

1. 添加插件市场并安装：
```bash
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
```

2. 初始化项目：
```bash
/archonflow:init
```

此命令自动创建目录结构、复制运行时文件并配置项目。之后即可使用 `/archonflow:proposal` 或任何技能。

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
| system-architect | Read, Grep, Glob, LS | ❌ | 只读；兼任仲裁者 |
| design-authority | Read, Grep, Glob, LS, Write, Edit | ✅ 契约, tokens | 无 src/ 访问 |
| data-architect | Read, Grep, Glob, Write | ✅ 数据契约 | 无 src/ 访问 |
| api-architect | Read, Grep, Glob, Write | ✅ API 契约, mock | 无 src/ 访问 |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | 完整开发工具 |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | 完整开发工具 |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| api-integration-auditor | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |
| code-backend-reviewer | Read, Grep, Glob, Bash | ❌ | **无 Write/Edit** |

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
├── analysis.md      ← 结构分析 + 模块依赖图
├── design.md        ← 设计契约（Given/When/Then）
├── api.md           ← API 契约（Given/When/Then）
├── data.md          ← 数据层契约
├── plan.md          ← 实现计划（微任务）
├── assumptions.md   ← 假设日志（REQUIRED/OPTIONAL/FORBIDDEN）
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
2. @api-integration-auditor — API 合规 + 前后端集成
3. @ux-compliance — UX 合规 vs 设计契约

全部通过后才能进入第二阶段。

### 第二阶段：代码质量（一致性）

审查者读取源代码评估质量。

4. @code-backend-reviewer — 代码质量 + 后端安全、性能、数据完整性

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

### API & 集成评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| Schema 合规 | 35% | 响应匹配契约 Schema |
| 状态码准确性 | 20% | HTTP 状态码匹配契约 |
| 错误格式 | 15% | 统一错误格式合规 |
| 认证 | 15% | 认证/授权按规范执行 |
| 向后兼容 | 15% | 不破坏现有 API |

### 代码 & 后端评分

| 维度 | 权重 | 检查内容 |
|------|------|---------|
| 安全性 | 30% | SQL 注入、XSS、CSRF、认证绕过 |
| 性能 | 25% | N+1 查询、缺失索引、分页 |
| 数据完整性 | 25% | 约束、验证、级联 |
| 错误处理 | 20% | 错误格式、日志、恢复 |
| 可读性 | 25% | 命名、结构、清晰度 |
| 模式一致性 | 25% | 遵循现有代码库模式 |
| 测试覆盖 | 25% | TDD 测试存在且覆盖契约场景 |
| 假设合规 | 25% | 假设不违反业务边界 |

### 项目预设阈值

| 审计者 | 企业级 | 标准 | 内部 |
|--------|--------|------|------|
| Visual Auditor | ≥ 95 | ≥ 85 | ≥ 70 |
| API & Integration | ≥ 95 | ≥ 90 | ≥ 85 |
| UX Compliance | ≥ 90 | ≥ 85 | ≥ 80 |
| Code & Backend | ≥ 90 | ≥ 85 | ≥ 80 |

### 颜色比较：CIEDE2000

我们使用 CIEDE2000（而非简单 RGB 距离）进行感知准确的色彩比较：
- ΔE00 < 2：人眼不可察觉
- ΔE00 2–5：轻微差异
- ΔE00 > 5：可见差异

---

## Fix Loop 与 Arbiter 仲裁

当审计评分低于阈值时，系统自动进入修复循环：

```
审计者（评分 < 阈值）
    ↓
Git 提交（回滚检查点）
    ↓
工程师（读取审计报告 + 记忆 + 契约，修复问题）
    ↓
更新 Agent 记忆文件
    ↓
审计者（新子代理，但有记忆，重新审计）
    ↓
如果评分 ≥ 阈值 → 通过 → 进入下一审计阶段
如果评分 < 阈值 → 再次循环
```

**Arbiter 仲裁机制**：当 Fix Loop 连续 2 次失败时，System Architect 作为仲裁者被调用。仲裁者审查契约、代码和审计报告，然后发布有约束力的 **Directive（指令）**。如果指令仍然失败 → 触发 HUMAN_INTERVENTION（人工介入）。

**Git Reset 机制**：每次修复前，当前代码状态会被提交。如果修复导致评分下降，回滚到修复前的提交，尝试不同方案。

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

## Assumption Log 假设日志

当契约没有规定某项内容时，工程师不会自行发明——而是记录假设：

| 类型 | 描述 | 示例 |
|------|------|------|
| **REQUIRED** | 必须在构建前验证；错误 = 返工 | "假设用户会话 30 分钟后过期" |
| **OPTIONAL** | 锦上添花；错误 = 微调 | "假设日期格式为 ISO 8601" |
| **FORBIDDEN** | 绝不允许——必须问 Design Authority | "假设 border-radius 应该是 8px" |

假设日志在 Code & Backend Review 阶段被审查，确保没有假设违反业务边界。

---

## 精准上下文注入

基于 System Architect 生成的模块依赖图，每个 Agent 只接收它需要的文件：

```
模块：UserAuth
  依赖：Database, SessionManager
  文件：src/auth/*, src/models/user.ts, src/middleware/auth.ts

→ Frontend Engineer 接收：design.md, api.md, tokens, src/auth/*
→ Backend Engineer 接收：api.md, data.md, src/models/user.ts, src/middleware/auth.ts
→ Visual Auditor 接收：design.md, 运行中应用（无源代码）
```

这防止了上下文窗口溢出，确保 Agent 专注于相关代码。

---

## 视觉审计算审分离

LLM 在数值计算上不可靠——它们会幻觉化色差值和像素差异。ArchonFlow 将**计算**与**解读**分离：

1. **脚本计算**（确定性）：
   - `npm run capture` — Playwright 截图
   - `npm run diff` — 使用 CIEDE2000 + Pixelmatch 计算像素/颜色/布局差异
   - `npm run score` — 从差异结果计算维度评分

2. **LLM 解读**（判断）：
   - 读取预计算的差异结果
   - 解读差异是否可接受
   - 提供定性评估和建议

Visual Auditor 绝不计算色差或像素差异——它只读取预计算结果并解读。

---

## 契约争议协议

构建 Agent 在发现技术问题时可以质疑契约：

1. 工程师发现契约问题
2. 在 assumptions.md 中记录问题
3. 通过 `@design-authority` 请求澄清
4. Design Authority 的裁决是最终的
5. 工程师根据裁决继续

这创建了从 Build → Design 的反馈回路，防止了契约一次写定永不质疑的瀑布流问题。

---

## 项目结构

执行 `/plugin install archonflow` 和 `/archonflow:init` 后，你的项目结构如下：

```
your-project/
├── .claude/                  ← Claude Code 从这里自动发现
│   ├── agents/                      # 10 个 subagent 定义
│   │   ├── system-architect.md
│   │   ├── design-authority.md
│   │   ├── api-architect.md
│   │   ├── data-architect.md
│   │   ├── frontend-engineer.md
│   │   ├── backend-engineer.md
│   │   ├── visual-auditor.md
│   │   ├── api-integration-auditor.md
│   │   ├── ux-compliance.md
│   │   └── code-backend-reviewer.md
│   └── skills/                      # 7 个流水线技能
│       ├── init/SKILL.md
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

### 1. 添加插件市场

ArchonFlow 通过自有的插件市场分发。先添加市场：

```bash
# 在 Claude Code 中，添加 ArchonFlow 插件市场
/plugin marketplace add evan3060/ArchonFlow
```

> **什么是插件市场？** Claude Code 插件通过市场分发——市场是托管在 Git 仓库中的策展目录。你需要先添加市场，才能从中安装插件。详见 [Claude Code 插件市场文档](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)。

### 2. 安装插件

```bash
/plugin install archonflow
```

### 3. 初始化项目

```bash
/archonflow:init
```

此命令自动创建目录结构、复制运行时文件（配置、模板、脚本），并引导你完成项目配置（名称、设计模式、预设、技术栈）。

### 4. 启动流水线

```
/archonflow:proposal
```

流水线将引导你完成 proposal → design → build → verify。

---

## 设计权衡与决策

本节记录了 v0.3 开发过程中的关键设计决策，包括推理过程和考虑过的替代方案。供后续查阅和重新审视决策时参考。

### Agent 精简（15 → 10）

**决策**：合并同视角 Agent 为统一 Agent。

**推理**：三位专家审查了原始 15 Agent 架构，独立指出了同一问题——过多视角重叠的 Agent 造成不必要的上下文切换和协调开销。关键洞察是：共享同一"视角"的 Agent（如 API Compliance 和 Integration Checker 都从外部通过 HTTP 测试）可以合并而不丧失认知隔离，因为认知隔离关乎 Agent 不能看到什么，而非是否有独立的 Agent。

**合并**：
| 合并前 | 合并后 | 理由 |
|--------|--------|------|
| Design Authority + Contract Generator + Design System Guardian | Design Authority | 同一视角（设计解释），顺序工作流 |
| API Compliance + Integration Checker | API & Integration Auditor | 同一视角（黑盒 HTTP 测试） |
| Backend Auditor + Code Reviewer | Code & Backend Reviewer | 同一视角（白盒源代码审查） |
| API Architect + Mock Server Generator | API Architect | 顺序工作流——先契约后 Mock |

**考虑过的替代方案**：
- 保留全部 15 个 Agent：协调开销太大，同视角 Agent 产生冗余发现
- 更激进合并（如所有审计者合一）：会丧失黑盒 vs 白盒的区别，而这正是认知隔离的关键
- 按阶段合并（如一个"设计 Agent"）：会丧失每个功能内的专业知识

**权衡**：合并后的 Agent 单个上下文窗口更大，但总上下文切换更少。净效果是正面的，因为同一 Agent 内的顺序步骤自然共享上下文。

### Arbiter 仲裁机制

**决策**：System Architect 兼任 Fix Loop 死锁的仲裁者。

**推理**：原始设计中，Fix Loop 可能在 Engineer 和 Auditor 之间无限循环，没有解决路径。Arbiter 提供了逃生口——一个可以打破僵局的中立第三方。选择 System Architect 的原因：
1. 它已有对契约和源代码的读取权限
2. 它理解架构意图
3. 它对 Engineer 和 Auditor 都没有偏向

**考虑过的替代方案**：
- 专用 Arbiter Agent：增加一个 Agent（回到 11 个），且 Arbiter 角色只在边缘情况需要
- 用户作为 Arbiter：破坏自主执行；用户不应需要解决技术争议
- Design Authority 作为 Arbiter：会造成偏向设计解释而非实现现实的偏见

**权衡**：System Architect 上下文更广但可能缺乏深度设计解释专业知识。Arbiter Directive 格式强制结构化推理，降低了此风险。

### Assumption Log vs. 严格"禁止发明"

**决策**：用分类的 Assumption Log 软化"禁止发明"规则。

**推理**：原始严格"禁止发明"规则理论上纯粹但实际有问题。工程师会在每个未指定的细节上阻塞，与 Design Authority 不断来回。Assumption Log 提供了中间地带：
- **REQUIRED** 假设必须在构建前验证
- **OPTIONAL** 假设可以继续但被追踪
- **FORBIDDEN** 假设（结构/视觉）仍然严格禁止

**考虑过的替代方案**：
- 保持严格"禁止发明"：阻塞点太多，拖慢流水线
- 允许所有假设：违背契约的目的
- 不分类：没有 REQUIRED/OPTIONAL/FORBIDDEN，无法优先审查

**权衡**：工程师可能过度将假设分类为 OPTIONAL 以避免阻塞。通过 Code & Backend Review 检查假设合规来缓解。

### 视觉审计：计算 vs. 解读

**决策**：脚本计算差异，LLM 仅解读结果。

**推理**：LLM 在数值计算上不可靠。测试表明 LLM 会幻觉化 CIEDE2000 值、误报像素差异、对同一截图产生不一致的评分。通过将所有计算移至确定性脚本（Playwright + Pixelmatch/OpenCV），LLM 只需行使判断力——这是它擅长的事。

**考虑过的替代方案**：
- 完全 LLM 视觉审计：不一致，幻觉化数字
- 完全脚本审计：无法解读定性差异（如"这个布局偏移是可接受的，因为它是响应式的"）
- 混合 LLM 验证：LLM 验证自己的计算不解决幻觉问题

**权衡**：需要维护视觉差异脚本，但可靠性增益值得。脚本产生确定性结果，可以版本控制和复现。

### 精准上下文注入

**决策**：使用模块依赖图仅向每个 Agent 注入相关文件。

**推理**：随着项目增长，将整个代码库加载到每个 Agent 的上下文中变得不切实际。模块依赖图（由 System Architect 生成）允许每个 Agent 只接收它需要的文件，防止上下文窗口溢出并减少无关代码导致的幻觉。

**考虑过的替代方案**：
- 加载所有内容：大项目上下文窗口溢出
- 手动文件选择：易出错，需要用户干预
- 启发式（如"加载上次提交修改的所有文件"）：遗漏依赖

**权衡**：依赖图准确性取决于 System Architect 的分析。不正确的图可能遗漏相关文件。通过允许 Agent 请求额外上下文来缓解。

### Git Reset 机制

**决策**：每次修复前自动提交；如果修复使情况变差则回滚。

**推理**：在 Fix Loop 中，工程师有时做的修改修复了一个问题但破坏了另一个，或者应用的修复不起作用并使代码状态变差。Git Reset 提供了安全网——你总是可以回到最后已知的好状态。

**考虑过的替代方案**：
- 不回滚：代码可能通过多次修复尝试而退化
- 手动回滚：破坏自主执行
- 每次修复一个分支：对自动化流水线来说 git 复杂度太高

**权衡**：每次修复迭代增加 git 操作，但安全网对通过多次修复尝试维持代码质量至关重要。

### 项目预设

**决策**：提供 Enterprise/Normal/Internal 三档不同阈值预设。

**推理**：并非所有项目都需要相同的质量标准。内部工具不需要 95% 的视觉保真度，但面向客户的产品需要。预设使得设置适当阈值变得容易，无需手动编辑每个值。

**考虑过的替代方案**：
- 单一阈值集：对不同项目类型太僵化
- 完全手动配置：设置开销太大
- 自动检测项目类型：没有明确用户输入不可靠

**权衡**：预设是粗粒度的。项目可能需要覆盖个别阈值。配置文件同时支持预设选择和单阈值覆盖。

---

## 许可证

MIT

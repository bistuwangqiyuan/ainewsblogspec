# Astro on Netlify Platform Starter

[Live Demo](https://astro-platform-starter.netlify.app/)

A modern starter based on Astro.js, Tailwind, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blob Store).

## Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Deploying to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/astro-platform-starter)

### 生产部署（两步式）

本项目要求严格的分步部署，先构建、再无构建部署到生产，避免长时间链路阻塞。

#### 前置准备

- 已安装并登录 Netlify CLI（`netlify --version` / `netlify login`）
- 已安装 pnpm（`pnpm --version`）
- 已链接站点（如未链接，运行 `netlify link` 并选择或创建站点）
- 配置 Supabase 运行所需环境变量（推荐在 Netlify 仪表盘 → Site settings → Environment variables 设置）：
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`

亦可在本地临时注入以完成构建（仅用于本地构建阶段）：

```powershell
$env:PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co";
$env:PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>";
```

#### 第一步：构建

```powershell
pnpm run build
```

构建成功后会生成 `dist/` 目录。

#### 第二步：无构建部署到生产

已链接站点：

```powershell
netlify deploy --prod --no-build
```

未链接或需指定站点：

```powershell
netlify deploy --prod --no-build --dir=dist --site <your-site-id>
```

部署完成后，CLI 会输出生产 URL 与 deploy id。请将生产 URL 记录在下文的“部署信息”中。

#### 常见问题排查

- 构建时报错 “Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY”：
  - 在 Netlify 站点环境变量中配置上述键值，或在本地构建前临时注入后再执行构建。
- Windows 路径与 netlify.toml：
  - 请使用正斜杠或避免在 toml 中写入未转义的反斜杠路径；本仓库已提供最小 `netlify.toml`。
- 首次部署较慢：
  - 按两步式进行，尽量避免一次性 `deploy --prod` 导致会话长时间阻塞。

### 部署信息

- 生产 URL：[ainewsblogspec.netlify.app](https://ainewsblogspec.netlify.app)
- 唯一 Deploy URL：[68b41267dc9050bfab8559d6--ainewsblogspec.netlify.app](https://68b41267dc9050bfab8559d6--ainewsblogspec.netlify.app)
- Logs：
  - Build logs：[Netlify Deploy Logs](https://app.netlify.com/projects/ainewsblogspec/deploys/68b41267dc9050bfab8559d6)
  - Functions：[Functions Logs](https://app.netlify.com/projects/ainewsblogspec/logs/functions)
  - Edge Functions：[Edge Functions Logs](https://app.netlify.com/projects/ainewsblogspec/logs/edge-functions)

## Developing Locally

| Prerequisites                                                                |
| :--------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v18.14+.                                      |
| (optional) [nvm](https://github.com/nvm-sh/nvm) for Node version management. |

1. Clone this repository, then run `npm install` in its root directory.

1. For the starter to have full functionality locally (e.g. edge functions, blob store), please ensure you have an up-to-date version of Netlify CLI. Run:

```bash
npm install netlify-cli@latest -g
```

1. Link your local repository to the deployed Netlify site. This will ensure you're using the same runtime version for both local development and your deployed site.

```bash
netlify link
```

1. Then, run the Astro.js development server via Netlify CLI:

```bash
netlify dev
```

If your browser doesn't navigate to the site automatically, visit [localhost:8888](http://localhost:8888).

## Tasks

- [x] 2025-08-30 安装并集成 Spec Workflow MCP（Claude/Cursor）

  - 目标：在用户/项目作用域注册 MCP 服务器名称 `spec-workflow`，指向包 `@pimzino/spec-workflow-mcp`，项目根路径 `C:\Users\wangqiyuan\project\cursor\ainewsblogspec`。
  - 完成标准：通过 `claude mcp get spec-workflow` 验证配置已生效；后续可在 IDE 内正常使用 MCP 工具与仪表盘。

- [x] 2025-08-30 使用 `steering-guide` 生成项目引导（spec-workflow MCP）

  - 在 Dashboard 或 IDE 的 MCP 工具中调用 `steering-guide`，输出方向/范围/架构/结构/质量门槛，严格基于本仓库上下文与规范。
  - 参考：[Pimzino/spec-workflow-mcp](https://github.com/Pimzino/spec-workflow-mcp)

- [x] 2025-08-30 创建 Steering 文档三件套

  - 路径：`.spec-workflow/steering/{product.md, tech.md, structure.md}`

- [x] 2025-08-30 创建首个规格文档集
  - 采集与入库：`.spec-workflow/specs/ingestion-pipeline/{requirements.md, design.md, tasks.md}`
  - 前端站点：`.spec-workflow/specs/frontend-site/{requirements.md, design.md, tasks.md}`

### Discovered During Work

- 暂无

## Spec Workflow MCP（Claude/Cursor）安装与配置

以下步骤将把规范工作流 MCP 接入到 Claude/Cursor 开发环境，统一以 pnpm 执行。参考来源：

- 官方 MCP 版本仓库：[`Pimzino/spec-workflow-mcp`](https://github.com/Pimzino/spec-workflow-mcp)
- NPM 包：[`@pimzino/spec-workflow-mcp`](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
- 旧版 Claude Code 工作流（仅做迁移参考）：[`Pimzino/claude-code-spec-workflow`](https://github.com/Pimzino/claude-code-spec-workflow)

### 1) 前置要求（Windows/PowerShell）

- Node.js ≥ 18.14（项目本身已要求）
- pnpm 可用（推荐通过 `corepack enable pnpm` 启用）
- 至少一种 MCP 客户端：
  - Claude Code CLI（可用 `claude --version` 检查）或
  - Cursor（手动配置 `~/.cursor/config.json`）

### 2) 使用 Claude CLI 注册 MCP 服务器（推荐）

在 PowerShell 中执行：

```powershell
claude mcp add spec-workflow -s user -- pnpm dlx @pimzino/spec-workflow-mcp@latest C:\Users\wangqiyuan\project\cursor\ainewsblogspec --AutoStartDashboard
claude mcp list
```

说明：

- 服务器名：`spec-workflow`（后续权限配置、自动许可等均以该名称识别）
- 使用 `pnpm dlx` 拉起 `@pimzino/spec-workflow-mcp@latest`，并指定项目根路径与自动启动仪表盘参数。

### 3) 使用 Cursor 集成（如未安装 Claude CLI）

将下述片段合并进用户目录的 Cursor 配置（Windows：`%USERPROFILE%/.cursor/config.json`）：

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "pnpm",
      "args": ["dlx", "@pimzino/spec-workflow-mcp@latest", "C:\\Users\\wangqiyuan\\project\\cursor\\ainewsblogspec", "--AutoStartDashboard"]
    }
  }
}
```

保存后重启 Cursor，并在对话中使用 MCP 工具即可。

### 4) 项目级权限配置（可选）

在仓库根目录的 `.claude/settings.json` 中预先允许 `spec-workflow` MCP 工具（已由本仓库提供示例）：

```json
{
  "permissions": {
    "allow": ["mcp__spec-workflow__*"]
  }
}
```

如需精细化控制，可替换为具体工具名（`mcp__<server>__<tool>`）。

### 5) 常见问题

- pnpm 未启用：执行 `corepack enable pnpm` 后重开终端。
- 无法启动仪表盘：确保命令包含 `--AutoStartDashboard`，或单独以 `--dashboard` 模式运行（参见包 README）。
- Windows 路径：在 JSON/命令中正确转义反斜杠（如 `C:\\Users\\...`）。

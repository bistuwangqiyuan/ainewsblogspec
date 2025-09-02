# 结构与规范（Steering · Structure）

## 目录结构（建议最小层级）

```
src/
  pages/                 路由（首页、关于、联系、登录、反馈、隐私、条款）
  components/            表格、过滤器、分页、Header、Footer、Alert 等
  layouts/               统一布局（含头/尾）
  utils/                 时间/格式化/Supabase 客户端等
  styles/                全局样式
.spec-workflow/
  steering/              本文档三件套
  specs/                 功能规格（requirements/design/tasks）
```

## 命名与代码风格

- 变量/函数：camelCase；组件：PascalCase；目录：kebab-case。
- 函数名用动词短语，变量名用名词短语；禁止 1-2 字母缩写。
- 复杂逻辑以 `# Reason:` 注释说明“为何如此设计”。
- 早返回、限制嵌套深度；不滥用 try/catch。

## UI/交互规范

- 列表为主：列（标题、来源、发布时间、热度、增长、操作）。
- 过滤器：关键词、分类、来源、时间窗（24h/7d/30d）。
- 排序：发布时间、热度、增长速度。
- 分页：服务端分页（Supabase range/limit）。
- 空态/错误：明确提示，不降级到假数据。

## 统一头尾

- 所有页面使用 `src/layouts/Layout.astro`，引入 `Header.astro` 与 `Footer.astro`。
- 页脚包含隐私、条款、联系等链接。

## 页面清单

- 首页（表格 + 过滤/排序 + 分页）。
- 登录/注册（Supabase Auth）。
- 反馈（登录可写、公共可读）。
- 关于我们、联系我们。
- 隐私政策、服务条款。
- 404/错误页。

## 测试

- 新功能至少 3 个用例：期望、边界、失败；
- `/tests` 与源码同构目录组织。

## 可访问性与响应式

- 语义化标签、键盘可达、对比度达标；
- 移动优先（本期以桌面端为主）。

## 错误处理

- 不使用回退/降级机制；统一 Alert 组件展示错误；
- 重要操作提供重试与引导。

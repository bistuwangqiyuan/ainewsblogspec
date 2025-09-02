# 前端站点（Design）

## 路由与页面

- `/`：首页表格；分页/筛选/排序；
- `/auth`：登录/注册；
- `/feedback`：反馈列表与提交；
- `/about`、`/contact`、`/privacy`、`/terms`：静态页；
- 通用：`/404` 错误页。

## 组件

- Table：文章行（标题、来源、时间、热度、增长、操作）。
- Filters：关键词、分类、来源、时间窗；
- SortBar：时间/热度/增长；
- Paginator：上一页/下一页 + 页码；
- Alert：错误/提示；
- Header/Footer：统一导航与页脚。

## 数据访问

- Supabase JS 客户端（仅 anon key）；
- 查询：`from('articles')` 选取必要列，`order()` + `range()`；
- 过滤：`ilike()`（关键词）、`eq()`（来源/分类），时间范围使用 `gte/lte`。

## SEO

- Astro 页面 head：title、meta、OG、Twitter、JSON-LD（ItemList）。
- sitemap/robots：构建时生成。

## 错误处理

- 网络错误/空数据：Alert 组件提示；不降级到假数据。
- 加载态：骨架屏或 Spinner；

## 安全

- 不泄露 service_role；
- 速率限制（分页限制、输入去抖）；

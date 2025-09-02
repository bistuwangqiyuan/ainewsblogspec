# 技术决策与架构（Steering · Tech）

## 总体架构

- 前端：Astro + Tailwind，部署于 Netlify（站点名：ainewsblogseo）。
- 数据与鉴权：Supabase（Postgres + Auth + Storage，必要时可用 pg_cron/pg_net 等数据库侧能力）。
- 规范与流程：Spec-Workflow-MCP（文档与流程）；数据库开发与设置通过 Supabase MCP 完成。
- 后端策略：不使用 Netlify Functions/Supabase Edge Functions 等后端软件；服务端工作流改由 CI 计划任务与数据库内置能力承担。

## 数据域与模型（概要）

- sources：源站（name、homepage_url、rss_url、language、is_active、created_at）。
- articles：文章（source_id、title、summary、content、author、original_url、cover_image_url、published_at、fetched_at、lang、hash_dedup、popularity_score、growth_score）。
- categories：分类（name、slug）。
- article_categories：文章-分类（article_id、category_id）。
- trends：关键词趋势（keyword、score、time_window、collected_at）。
- ingestion_jobs / ingestion_logs：抓取作业与日志。
- feedback：用户反馈（user_id、title、content、status、created_at）。

### 建表与索引（SQL 参考）

```sql
create table if not exists public.sources (
  id bigserial primary key,
  name text not null,
  homepage_url text not null,
  rss_url text,
  language text default 'zh',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(homepage_url)
);

create table if not exists public.articles (
  id bigserial primary key,
  source_id bigint references public.sources(id) on delete set null,
  title text not null,
  summary text,
  content text,
  author text,
  original_url text not null,
  cover_image_url text,
  published_at timestamptz,
  fetched_at timestamptz default now(),
  lang text default 'zh',
  hash_dedup text not null,
  popularity_score numeric(10,4) default 0,
  growth_score numeric(10,4) default 0,
  unique(original_url)
);
create index if not exists idx_articles_published on public.articles(published_at desc);
create index if not exists idx_articles_scores on public.articles(popularity_score desc, growth_score desc);
create index if not exists idx_articles_hash on public.articles(hash_dedup);

create table if not exists public.categories (
  id bigserial primary key,
  name text not null unique,
  slug text not null unique
);

create table if not exists public.article_categories (
  article_id bigint references public.articles(id) on delete cascade,
  category_id bigint references public.categories(id) on delete cascade,
  primary key(article_id, category_id)
);

create table if not exists public.trends (
  id bigserial primary key,
  keyword text not null,
  score numeric(10,4) not null,
  time_window text not null,
  collected_at timestamptz default now()
);
create index if not exists idx_trends_kw_time on public.trends(keyword, time_window);

create table if not exists public.ingestion_jobs (
  id bigserial primary key,
  job_date date not null,
  status text not null check (status in ('pending','running','success','failed')),
  total_fetched int default 0,
  total_inserted int default 0,
  total_duplicated int default 0,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.ingestion_logs (
  id bigserial primary key,
  job_id bigint references public.ingestion_jobs(id) on delete cascade,
  source_id bigint references public.sources(id) on delete set null,
  level text not null check (level in ('info','warn','error')),
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.feedback (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  status text not null default 'open' check (status in ('open','triaged','closed')),
  created_at timestamptz default now()
);
create index if not exists idx_feedback_user on public.feedback(user_id);
```

## RLS 与权限（示例）

```sql
alter table public.articles enable row level security;
alter table public.sources enable row level security;
alter table public.categories enable row level security;
alter table public.article_categories enable row level security;
alter table public.trends enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.ingestion_logs enable row level security;
alter table public.feedback enable row level security;

-- 匿名可读（公开数据）
create policy anon_read_articles on public.articles for select using (true);
create policy anon_read_sources on public.sources for select using (true);
create policy anon_read_categories on public.categories for select using (true);
create policy anon_read_article_categories on public.article_categories for select using (true);
create policy anon_read_trends on public.trends for select using (true);

-- 反馈：登录写入本人记录，所有人可读
create policy auth_insert_feedback on public.feedback for insert with check (auth.uid() = user_id);
create policy anon_read_feedback on public.feedback for select using (true);
```

## 抓取与去重

- 调度：CI 定时任务（GitHub Actions cron）每日运行抓取脚本，避免引入后端函数。
- 解析：按源站适配器提取标题、摘要、正文片段、封面、作者、时间、标签。
- 去重：
  - 指纹：`hash_dedup = sha256(lower(title) || domain(original_url))`；
  - 标题近似（SimHash/MinHash 思路）+ 同站点阈值；
  - `published_at` ± 48h 时间窗联合判断。
- 评分：`popularity_score` 与 `growth_score` 按来源权重、趋势与时间衰减计算。

## 前端渲染与交互

- Astro 静态优先，必要交互使用 Islands；
- 列表页：分页、排序（时间/热度/增长）、筛选（分类/来源/时间窗/关键词）。
- 仅以 anon key 读取；写入（反馈）需登录。

## SEO 与可访问性

- canonical、OG、Twitter、JSON-LD（ItemList/Article）；sitemap.xml、robots.txt；
- a11y：语义化、键盘可达、对比度达标。

## 安全与稳定性

- 严禁模拟/降级/回退数据；失败以明确提示呈现。
- 接口限流、退避重试；
- 机密仅存放于受管环境（GitHub Secrets/Netlify env）。

## 部署与环境

- Netlify 两步发布：先构建（pnpm build），再 `netlify deploy --prod --no-build`；
- 环境变量（Netlify）：`SUPABASE_URL`、`SUPABASE_ANON_KEY`；
- CI 任务使用 `SUPABASE_SERVICE_ROLE` 等机密写库。

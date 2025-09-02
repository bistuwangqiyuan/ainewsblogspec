-- DDL init for ainewsblogspec (public schema)
-- tables
create table if not exists public.sources (
    id bigserial primary key,
    name text not null,
    homepage_url text not null unique,
    rss_url text,
    language text default 'zh',
    is_active boolean default true,
    created_at timestamptz default now()
);
create table if not exists public.articles (
    id bigserial primary key,
    source_id bigint references public.sources(id) on delete
    set null,
        title text not null,
        summary text,
        content text,
        author text,
        original_url text not null unique,
        cover_image_url text,
        published_at timestamptz,
        fetched_at timestamptz default now(),
        lang text default 'zh',
        hash_dedup text not null,
        popularity_score numeric(10, 4) default 0,
        growth_score numeric(10, 4) default 0
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
    score numeric(10, 4) not null,
    time_window text not null,
    collected_at timestamptz default now()
);
create index if not exists idx_trends_kw_time on public.trends(keyword, time_window);
create table if not exists public.ingestion_jobs (
    id bigserial primary key,
    job_date date not null,
    status text not null check (
        status in ('pending', 'running', 'success', 'failed')
    ),
    total_fetched int default 0,
    total_inserted int default 0,
    total_duplicated int default 0,
    error_message text,
    created_at timestamptz default now()
);
create table if not exists public.ingestion_logs (
    id bigserial primary key,
    job_id bigint references public.ingestion_jobs(id) on delete cascade,
    source_id bigint references public.sources(id) on delete
    set null,
        level text not null check (level in ('info', 'warn', 'error')),
        message text not null,
        created_at timestamptz default now()
);
create table if not exists public.feedback (
    id bigserial primary key,
    user_id uuid references auth.users(id) on delete
    set null,
        title text not null,
        content text not null,
        status text not null default 'open' check (status in ('open', 'triaged', 'closed')),
        created_at timestamptz default now()
);
create index if not exists idx_feedback_user on public.feedback(user_id);
-- RLS
alter table public.articles enable row level security;
alter table public.sources enable row level security;
alter table public.categories enable row level security;
alter table public.article_categories enable row level security;
alter table public.trends enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.ingestion_logs enable row level security;
alter table public.feedback enable row level security;
-- public read policies
create policy if not exists anon_read_articles on public.articles for
select using (true);
create policy if not exists anon_read_sources on public.sources for
select using (true);
create policy if not exists anon_read_categories on public.categories for
select using (true);
create policy if not exists anon_read_article_categories on public.article_categories for
select using (true);
create policy if not exists anon_read_trends on public.trends for
select using (true);
create policy if not exists anon_read_feedback on public.feedback for
select using (true);
-- feedback insert by owner
create policy if not exists auth_insert_feedback on public.feedback for
insert with check (auth.uid() = user_id);
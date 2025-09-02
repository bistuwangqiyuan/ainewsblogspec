# 采集与入库（Design）

## 架构概览

- 触发：CI 定时任务（GitHub Actions cron，Asia/Shanghai）。
- 流程：拉取 → 解析 → 去重 → 评分 → 入库 → 记录作业与日志。

## 源站适配器

- 统一接口：fetchList() → ArticleRaw[]；fetchDetail(url) 可选。
- 支持类型：HTML、RSS、公开 API；
- 解析字段：title、summary、content（片段）、cover、author、published_at、tags、original_url、source。

## 去重

- 指纹：`hash_dedup = sha256(lower(title) || domain(original_url))`；
- 近似：标题相似度 + 同站点阈值；
- 窗口：published_at ± 48h。

## 评分

- popularity_score：来源权重 × 当日曝光 × 趋势相关度；
- growth_score：时间衰减的增长估计；
- 趋势：结合 trends 表（Google Trends now）进行相关度加权。

## 数据写入

- Upsert articles（original_url 唯一）；
- 维护 categories 与 article_categories；
- 写入 ingestion_jobs/ingestion_logs。

## 错误与重试

- 单源失败不影响整体作业；
- 网络错误退避重试；
- 记录 error 日志并统计。

## 对外接口

- Supabase 表：articles/sources/categories/article_categories/trends/ingestion_jobs/ingestion_logs；
- 仅提供只读查询给前端；写入由任务完成。

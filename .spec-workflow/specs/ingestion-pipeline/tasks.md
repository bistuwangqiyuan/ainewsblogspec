# 采集与入库（Tasks）

## 任务拆解

1. 建表与索引（sources/articles/categories/article_categories/trends/ingestion_jobs/ingestion_logs/feedback）。
2. 实现源站清单与权重配置（JSON/表）。
3. 开发 HTML/RSS/API 适配器与解析器。
4. 实现去重（hash_dedup + 近似 + 时间窗）。
5. 计算评分（popularity/growth）。
6. Upsert 入库与分类关联。
7. 记录作业与日志。
8. 配置 CI 定时任务。

## 验收用例

- 期望：100 条输入 → ≥ 90 条新写入、≤ 10% 重复。
- 边界：同标题不同域名、相近时间的重复条目处理正确。
- 失败：单源网络错误被记录且不影响整体作业结束状态。

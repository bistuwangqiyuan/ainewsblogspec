# 采集与入库（Requirements）

## 目标

- 每日自动采集 ≥ 100 条中文「AI 编程工具/实践」资讯。
- 去重、标准化、评分后入库 Supabase；入库成功率 ≥ 95%。

## 范围

- 源站调研、适配器（HTML/RSS/API）。
- 去重策略：hash_dedup + 标题近似 + 时间窗口。
- 评分：popularity_score、growth_score。
- 作业与日志：ingestion_jobs/ingestion_logs 记录。

## 非范围

- 内容审核、推荐算法、后台管理。

## 关键约束

- 严禁模拟/降级数据；失败以明确提示记录日志。
- 遵守 robots 与源站政策。

## 验收

- 7 日内日均入库量 ≥ 100，重复率 ≤ 10%。
- 作业日志完整可追踪。

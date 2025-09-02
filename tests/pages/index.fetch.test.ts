import { describe, it, expect } from 'vitest';
import { fetchArticles } from '../../src/utils/supabaseClient';

describe('首页数据获取', () => {
  it('默认按时间倒序获取第一页数据', async () => {
    const { data, total } = await fetchArticles({ page: 1, pageSize: 10, sort: 'published_at', order: 'desc' });
    expect(Array.isArray(data)).toBe(true);
    expect(typeof total === 'number').toBe(true);
  });

  it('关键词筛选', async () => {
    const { data } = await fetchArticles({ page: 1, pageSize: 5, keyword: 'AI' });
    expect(Array.isArray(data)).toBe(true);
  });

  it('错误排序字段时报错', async () => {
    // @ts-expect-error 测试无效字段
    await expect(fetchArticles({ page: 1, pageSize: 5, sort: 'not_exists' })).rejects.toBeTruthy();
  });
});



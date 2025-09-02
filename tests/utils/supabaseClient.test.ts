import { describe, it, expect } from 'vitest';
import { fetchArticles } from '../../src/utils/supabaseClient';

describe('fetchArticles', () => {
  it('handles empty keyword and returns array', async () => {
    const res = await fetchArticles({ page: 1, pageSize: 1 });
    expect(res).toHaveProperty('data');
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('applies pagination correctly', async () => {
    const a = await fetchArticles({ page: 1, pageSize: 1 });
    const b = await fetchArticles({ page: 2, pageSize: 1 });
    if (a.data[0] && b.data[0]) {
      expect(a.data[0].id).not.toBe(b.data[0].id);
    }
  });

  it('fails with invalid sort field', async () => {
    // @ts-expect-error invalid sort
    await expect(fetchArticles({ page: 1, pageSize: 1, sort: 'unknown' })).rejects.toBeTruthy();
  });
});



import { parsePagination, buildPaginationMeta } from '../utils/pagination';

describe('parsePagination', () => {
  it('should return defaults for empty query', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('should parse valid page and limit', () => {
    const result = parsePagination({ page: '2', limit: '10' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(10);
  });

  it('should cap limit at 100', () => {
    const result = parsePagination({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('should ensure minimum page of 1', () => {
    const result = parsePagination({ page: '0' });
    expect(result.page).toBe(1);
  });

  it('should ensure minimum limit of 1', () => {
    const result = parsePagination({ limit: '0' });
    expect(result.limit).toBe(1);
  });
});

describe('buildPaginationMeta', () => {
  it('should build meta for first page with more items', () => {
    const meta = buildPaginationMeta(50, { page: 1, limit: 20, skip: 0 });
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.total).toBe(50);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(false);
  });

  it('should build meta for last page', () => {
    const meta = buildPaginationMeta(50, { page: 3, limit: 20, skip: 40 });
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });

  it('should handle empty results', () => {
    const meta = buildPaginationMeta(0, { page: 1, limit: 20, skip: 0 });
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });
});

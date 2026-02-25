export interface BulkResult<T, R> {
  item: T;
  result: R | null;
  error: string | null;
}

export async function throttledBulkProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  delayMs = 100,
): Promise<Array<BulkResult<T, R>>> {
  const results: Array<BulkResult<T, R>> = [];
  for (const item of items) {
    try {
      const result = await processor(item);
      results.push({ item, result, error: null });
    } catch (e) {
      results.push({ item, result: null, error: (e as Error).message });
    }
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

import { useEffect, useState } from 'react';
import { RecordOperation, QueryOrExpression, buildQuery } from '@orbit/data';
import MemorySource, { MemoryCache } from '@orbit/memory';
import { QueryResultData } from '@orbit/record-cache';

export function useQuery(
  cacheOrSource: MemoryCache | MemorySource,
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
): QueryResultData {
  const [result, setResult] = useState<QueryResultData>();
  const cache =
    cacheOrSource instanceof MemoryCache ? cacheOrSource : cacheOrSource.cache;
  const { live, ...queryOptions } = (options || {}) as any;

  useEffect(() => {
    const query = buildQuery(
      queryOrExpression,
      queryOptions,
      id,
      cacheOrSource.queryBuilder
    );
    const expression = query.expression as any;

    function onPatch(operation: RecordOperation) {
      if (!expression.type || expression.type === operation.record.type) {
        setResult(cache.query(query));
      }
    }

    let isMounted = true;
    if (cacheOrSource instanceof MemoryCache) {
      setResult(cache.query(query));
    } else {
      cacheOrSource.query(query).then(result => {
        if (isMounted) {
          setResult(result);
        }
      });
    }

    if (live !== false) {
      cache.on('patch', onPatch);
    }
    return () => {
      isMounted = false;
      if (live !== false) {
        cache.off('patch', onPatch);
      }
    };
  }, [queryOrExpression, options, id]);

  return result;
}

export function useCount(
  cache: MemoryCache,
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
): Number {
  const result = useQuery(cache, queryOrExpression, options, id);

  if (Array.isArray(result)) {
    return result.length;
  } else if (result) {
    return 1;
  }
  return 0;
}

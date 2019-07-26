import {
  RecordOperation,
  QueryOrExpression,
  buildQuery,
  Query
} from '@orbit/data';
import { MemoryCache } from '@orbit/memory';
import { QueryResultData } from '@orbit/record-cache';

import callbackToAsyncIterator from './utils/callback-to-async-iterator';

export default function liveQuery(
  cache: MemoryCache,
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
): LiveQueryIterable {
  const query = buildQuery(queryOrExpression, options, id, cache.queryBuilder);
  return new LiveQueryIterable(cache, query);
}

class LiveQueryIterable implements AsyncIterable<QueryResultData> {
  private _cache: MemoryCache;
  private _query: Query;

  constructor(cache: MemoryCache, query: Query) {
    this._cache = cache;
    this._query = query;
  }

  [Symbol.asyncIterator](): AsyncIterator<QueryResultData> {
    const { _query: query, _cache: cache } = this;

    return callbackToAsyncIterator(
      async (callback: (value: QueryResultData) => void) => {
        function onPatch(operation: RecordOperation) {
          const expression = query.expression as any;
          if (!expression.type || expression.type === operation.record.type) {
            callback(cache.query(query));
          }
        }
        function onReset() {
          callback(cache.query(query));
        }
        callback(cache.query(query));
        cache.on('patch', onPatch);
        cache.on('reset', onReset);
        return () => {
          cache.off('patch', onPatch);
          cache.off('reset', onReset);
        };
      },
      {
        onClose: unsubscribe => unsubscribe()
      }
    );
  }
}

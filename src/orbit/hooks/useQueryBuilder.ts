import { useMemo, useRef, useContext } from 'react';
import { eq } from '@orbit/utils';
import { QueryOrExpression, Query, buildQuery } from '@orbit/data';

import { Context } from '../context';

/** Creates a request from a query and variables but preserves reference equality if the key isn't changing */
export default function useQueryBuilder(
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
) {
  const prev = useRef<undefined | Query>(undefined);
  const queryBuilder = useContext(Context).cache.queryBuilder;

  return useMemo(() => {
    const query = buildQuery(queryOrExpression, options, id, queryBuilder);
    // We manually ensure reference equality if the key hasn't changed
    if (prev.current !== undefined && isQueryEqual(prev.current, query)) {
      return prev.current;
    } else {
      prev.current = query;
      return query;
    }
  }, [queryOrExpression, options, id]);
}

function isQueryEqual(query: Query, otherQuery: Query): boolean {
  return (
    eq(query.expression, otherQuery.expression) &&
    eq(query.options, otherQuery.options)
  );
}

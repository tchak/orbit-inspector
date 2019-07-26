import { useRef, useCallback, useContext } from 'react';
import { QueryOrExpression } from '@orbit/data';
import { QueryResultData } from '@orbit/record-cache';

import { Context } from '../context';
import useImmediateEffect from './useImmediateEffect';
import useImmediateState from './useImmediateState';
import useQueryBuilder from './useQueryBuilder';

import liveQuery from '../liveQuery';
import subscribe from '../utils/subscribe';

export interface UseQueryState {
  data?: QueryResultData;
  error?: Error;
}

export type UseQueryResponse = [UseQueryState, () => void];

export default function useQuery(
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
): UseQueryResponse {
  const unsubscribe = useRef(() => {});
  const [state, setState] = useImmediateState<UseQueryState>({});
  const cache = useContext(Context).cache;
  const query = useQueryBuilder(queryOrExpression, options, id);

  const executeQuery = useCallback(() => {
    unsubscribe.current();
    const iterable = liveQuery(cache, query);
    unsubscribe.current = subscribe(iterable, data => {
      setState({ data });
    });
  }, [query.id, setState]);

  useImmediateEffect(() => {
    executeQuery();
    return () => unsubscribe.current();
  }, [executeQuery, setState]);

  return [state, executeQuery];
}

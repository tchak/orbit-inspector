import { QueryOrExpression } from '@orbit/data';

import useQuery from './useQuery';

export default function useCount(
  queryOrExpression: QueryOrExpression,
  options?: object,
  id?: string
): Number {
  const [{ data }] = useQuery(queryOrExpression, options, id);

  if (Array.isArray(data)) {
    return data.length;
  } else if (data) {
    return 1;
  }
  return 0;
}

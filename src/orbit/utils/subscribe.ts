export type NextCallback<T> = (value: T) => void;

export interface Obsever<T> {
  next: NextCallback<T>;
  error: (error: Error) => void;
  complet: () => void;
}

export default function subscribe<T>(
  iterable: AsyncIterable<T>,
  observer: Obsever<T> | NextCallback<T>
): () => void {
  const iterator = iterable[Symbol.asyncIterator]();
  observer = makeObserver(observer);
  next(iterator, observer);
  return () => iterator.return();
}

async function next<T>(
  iterator: AsyncIterator<T>,
  observer: Obsever<T>
): Promise<void> {
  try {
    const { done, value }: IteratorResult<T> = await iterator.next();

    if (done) {
      observer.complet();
    } else {
      observer.next(value);
      next(iterator, observer);
    }
  } catch (e) {
    observer.error(e);
  }
}

function makeObserver<T>(observer: Obsever<T> | NextCallback<T>): Obsever<T> {
  if (isNextCallback(observer)) {
    observer = {
      next: observer,
      error: () => {},
      complet: () => {}
    };
  }
  return observer;
}

function isNextCallback<T>(
  observer: Obsever<T> | NextCallback<T>
): observer is NextCallback<T> {
  return typeof observer === 'function';
}

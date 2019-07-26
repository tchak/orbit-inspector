export interface Options<G> {
  onError?: (err: Error) => void;
  onClose?: (arg?: G) => void;
  buffering?: boolean;
}

export default function callbackToAsyncIterator<T, G>(
  listener: (callback: (input: T) => void) => Promise<G>,
  options?: Options<G>
): AsyncIterableIterator<T> {
  const { onError = defaultOnError, buffering = true, onClose } = options;
  try {
    let pullQueue = [];
    let pushQueue = [];
    let listening = true;
    let listenerReturnValue;

    listener(value => pushValue(value))
      .then(a => {
        listenerReturnValue = a;
      })
      .catch(err => {
        onError(err);
      });

    function pushValue(value) {
      if (pullQueue.length !== 0) {
        pullQueue.shift()({ value, done: false });
      } else if (buffering === true) {
        pushQueue.push(value);
      }
    }

    function pullValue() {
      return new Promise(resolve => {
        if (pushQueue.length !== 0) {
          resolve({ value: pushQueue.shift(), done: false });
        } else {
          pullQueue.push(resolve);
        }
      });
    }

    function emptyQueue() {
      if (listening) {
        listening = false;
        pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
        pullQueue = [];
        pushQueue = [];
        onClose && onClose(listenerReturnValue);
      }
    }

    return {
      next(): Promise<IteratorResult<T>> {
        return listening ? pullValue() : this.return();
      },
      return(): Promise<{ value: typeof undefined; done: boolean }> {
        emptyQueue();
        return Promise.resolve({ value: undefined, done: true });
      },
      throw(error) {
        emptyQueue();
        onError(error);
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  } catch (err) {
    onError(err);
    return {
      next() {
        return Promise.reject(err);
      },
      return() {
        return Promise.reject(err);
      },
      throw(error) {
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}

function defaultOnError(err: Error) {
  throw err;
}

import { useRef, useSyncExternalStore } from 'react';

import type { Store } from './create-store';

function isEqual<R>(a: R, b: R): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
  }
  return false;
}

export function useStore<T, R>(store: Store<T>, selector: (state: T) => R): R {
  const cache = useRef<{ result: R } | null>(null);

  // Recomputes the selector on every call (cheap for this app's store sizes) and keeps
  // the previous result reference when it is shallowly equal, so selectors like `.filter()`
  // stay stable across re-renders instead of tricking useSyncExternalStore into looping,
  // while still reacting to selector inputs (e.g. a `kind` argument) that live outside `state`.
  function getSnapshot(): R {
    const result = selector(store.getState());
    if (cache.current !== null && isEqual(cache.current.result, result)) {
      return cache.current.result;
    }
    cache.current = { result };
    return result;
  }

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

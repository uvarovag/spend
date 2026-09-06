import { createStore } from './create-store';
import { useStore } from './use-store';

interface ValueStore<T> {
  useValue: () => T;
  setValue: (updater: T | ((state: T) => T)) => void;
}

export function createValueStore<T>(initialState: T): ValueStore<T> {
  const store = createStore(initialState);

  return {
    useValue: () => useStore(store, (state) => state),
    setValue: store.setState,
  };
}

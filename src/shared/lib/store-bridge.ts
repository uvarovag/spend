import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

// Type-only import: erased at compile time, so this file has no runtime dependency on
// `./store` — unlike `./store`, which imports each entity's reducer to assemble the store.
// Entities' non-hook mutation functions (createAccount, updateAccount, …) need to dispatch
// without importing `./store` directly, or that entities -> store -> entities loop would be a
// real circular `require()` at runtime, which Metro does not resolve safely (store.ts ends up
// with an `undefined` reducer import). `store.ts` calls `registerStore` once, after creating the
// real store, so this bridge is live before any dispatch/getState call happens.
import type { AppDispatch, RootState } from './store';

interface StoreBridge {
  dispatch: AppDispatch;
  getState: () => RootState;
}

let storeBridge: StoreBridge | null = null;

export function registerStore(store: StoreBridge): void {
  storeBridge = store;
}

function getStoreBridge(): StoreBridge {
  if (!storeBridge) {
    throw new Error('Store is not registered yet — shared/lib/store.ts must be imported before dispatching.');
  }
  return storeBridge;
}

export function dispatch(action: Parameters<AppDispatch>[0]): ReturnType<AppDispatch> {
  return getStoreBridge().dispatch(action);
}

export function getState(): RootState {
  return getStoreBridge().getState();
}

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

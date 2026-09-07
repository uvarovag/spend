import { Storage } from 'expo-sqlite/kv-store';

import { createStore } from './create-store';
import { useStore } from './use-store';

interface ValueStore<T> {
  useValue: () => T;
  getValue: () => T;
  setValue: (updater: T | ((state: T) => T)) => void;
}

// `persistKey` is opt-in (business-logic-plan.md, Step 11): most value stores are ephemeral,
// intra-session bridges (e.g. `picked-category-store.ts`) or working drafts (`feed-filters-store.ts`)
// that should NOT survive a restart, so only settings that are genuinely user preferences pass one.
export function createValueStore<T>(initialState: T, persistKey?: string): ValueStore<T> {
  const store = createStore(readPersistedValue(persistKey, initialState));

  return {
    useValue: () => useStore(store, (state) => state),
    getValue: store.getState,
    setValue: (updater) => {
      store.setState(updater);
      if (persistKey) {
        Storage.setItemSync(persistKey, JSON.stringify(store.getState()));
      }
    },
  };
}

function readPersistedValue<T>(persistKey: string | undefined, initialState: T): T {
  if (!persistKey) {
    return initialState;
  }
  const raw = Storage.getItemSync(persistKey);
  if (raw === null) {
    return initialState;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse persisted value for key "${persistKey}":`, error);
    return initialState;
  }
}

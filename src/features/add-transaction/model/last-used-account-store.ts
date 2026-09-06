import { createValueStore } from '@/shared/lib/create-value-store';

const lastUsedAccountStore = createValueStore<string | null>(null);

export function useLastUsedAccountId(): string | null {
  return lastUsedAccountStore.useValue();
}

export function setLastUsedAccountId(accountId: string): void {
  lastUsedAccountStore.setValue(accountId);
}

import { createValueStore } from '@/shared/lib/create-value-store';

interface PickedAccount {
  requestId: string;
  accountId: string;
}

const pickedAccountStore = createValueStore<PickedAccount | null>(null);

export function usePickedAccount(): PickedAccount | null {
  return pickedAccountStore.useValue();
}

export function pickAccount(requestId: string, accountId: string): void {
  pickedAccountStore.setValue({ requestId, accountId });
}

export function clearPickedAccount(): void {
  pickedAccountStore.setValue(null);
}

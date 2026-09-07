import { createValueStore } from '@/shared/lib/create-value-store';

interface PickedAccount {
  requestId: string;
  accountId: string;
}

// No persistKey (business-logic-plan.md, Step 11) — same reasoning as `picked-category-store.ts`:
// a transient navigation bridge back from `pick-account`, not a setting.
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

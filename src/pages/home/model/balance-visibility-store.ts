import { createValueStore } from '@/shared/lib/create-value-store';

// Persisted (business-logic-plan.md, Step 11 pattern): hiding the balance is a privacy preference
// for using the app in public, not a transient view state — a restart must not silently reveal it.
const balanceHiddenStore = createValueStore<boolean>(false, 'balance-hidden');

export function useIsBalanceHidden(): boolean {
  return balanceHiddenStore.useValue();
}

export function toggleBalanceHidden(): void {
  balanceHiddenStore.setValue((hidden) => !hidden);
}

import { createValueStore } from './create-value-store';

// No persistKey (business-logic-plan.md, Step 11 pattern) — a transient navigation bridge back
// from `pick-date`, same shape as `picked-account-store.ts`/`picked-category-store.ts`. Lives in
// `shared` rather than an entity or a single feature because a date isn't owned by one entity, and
// both `features/add-transaction` and `features/transfer` need to read it.
const pickedDateStore = createValueStore<string | null>(null);

export function usePickedDate(): string | null {
  return pickedDateStore.useValue();
}

export function pickDate(date: Date): void {
  pickedDateStore.setValue(date.toISOString());
}

export function clearPickedDate(): void {
  pickedDateStore.setValue(null);
}

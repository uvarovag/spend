import { createValueStore } from '@/shared/lib/create-value-store';

// No persistKey (business-logic-plan.md, Step 11): this is a transient navigation bridge back
// from the `pick-category` screen, always cleared right after the form reads it — not a setting,
// so a value surviving a restart would just leak a stale pick into an unrelated future session.
const pickedCategoryIdStore = createValueStore<string | null>(null);

export function usePickedCategoryId(): string | null {
  return pickedCategoryIdStore.useValue();
}

export function pickCategoryId(categoryId: string): void {
  pickedCategoryIdStore.setValue(categoryId);
}

export function clearPickedCategoryId(): void {
  pickedCategoryIdStore.setValue(null);
}

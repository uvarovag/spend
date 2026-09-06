import { createValueStore } from '@/shared/lib/create-value-store';

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

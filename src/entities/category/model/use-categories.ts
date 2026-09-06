import { createStore } from '@/shared/lib/create-store';
import { generateId } from '@/shared/lib/generate-id';
import { useStore } from '@/shared/lib/use-store';

import { mockCategories } from './mock-data';
import type { Category, CategoryKind } from './types';

const categoryStore = createStore<Category[]>(mockCategories);

export function useCategories(kind: CategoryKind): Category[] {
  return useStore(categoryStore, (categories) =>
    categories
      .filter((category) => category.kind === kind && category.archivedAt === null)
      .sort((a, b) => a.order - b.order)
  );
}

export function getCategory(categoryId: string): Category | undefined {
  return categoryStore.getState().find((category) => category.id === categoryId);
}

export type NewCategory = Omit<Category, 'id' | 'order' | 'archivedAt'>;

export function createCategory(category: NewCategory): void {
  const id = generateId('category');
  categoryStore.setState((categories) => {
    const maxOrder = Math.max(-1, ...categories.filter((c) => c.kind === category.kind).map((c) => c.order));
    return [...categories, { ...category, id, order: maxOrder + 1, archivedAt: null }];
  });
}

export function updateCategory(
  categoryId: string,
  changes: Partial<Omit<Category, 'id' | 'kind' | 'order' | 'archivedAt'>>
): void {
  categoryStore.setState((categories) =>
    categories.map((category) => (category.id === categoryId ? { ...category, ...changes } : category))
  );
}

export function archiveCategory(categoryId: string): void {
  categoryStore.setState((categories) =>
    categories.map((category) =>
      category.id === categoryId ? { ...category, archivedAt: new Date().toISOString() } : category
    )
  );
}

export function reorderCategories(kind: CategoryKind, orderedCategoryIds: string[]): void {
  categoryStore.setState((categories) =>
    categories.map((category) => {
      if (category.kind !== kind) {
        return category;
      }
      const order = orderedCategoryIds.indexOf(category.id);
      return order === -1 ? category : { ...category, order };
    })
  );
}

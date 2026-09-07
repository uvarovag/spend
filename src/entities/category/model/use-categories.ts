import { createEntityAdapter, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { eq } from 'drizzle-orm';
import { useMemo } from 'react';

import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { generateId } from '@/shared/lib/generate-id';
import { dispatch, getState, useAppSelector } from '@/shared/lib/store-bridge';

import { mockCategories } from './mock-data';
import { categoriesTable } from './schema';
import type { Category, CategoryKind } from './types';

const categoriesAdapter = createEntityAdapter<Category>();
type CategoriesState = ReturnType<typeof categoriesAdapter.getInitialState>;

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: categoriesAdapter.getInitialState(),
  reducers: {
    categoryAdded: categoriesAdapter.addOne,
    categoryUpdated: categoriesAdapter.updateOne,
    categoriesReordered: (state, action: PayloadAction<{ kind: CategoryKind; orderedCategoryIds: string[] }>) => {
      const { kind, orderedCategoryIds } = action.payload;
      const updates = orderedCategoryIds
        .map((id, order) => ({ id, order }))
        .filter(({ id }) => state.entities[id]?.kind === kind)
        .map(({ id, order }) => ({ id, changes: { order } }));
      categoriesAdapter.updateMany(state, updates);
    },
    // Replaces the whole collection with what was just read from SQLite at startup.
    categoriesHydrated: categoriesAdapter.setAll,
  },
});

export const categoriesReducer = categoriesSlice.reducer;
const { categoryAdded, categoryUpdated, categoriesReordered, categoriesHydrated } = categoriesSlice.actions;

const categoriesSelectors = categoriesAdapter.getSelectors();

function createCategoriesOfKindSelector() {
  return createSelector(
    (state: CategoriesState) => categoriesSelectors.selectAll(state),
    (_: CategoriesState, kind: CategoryKind) => kind,
    (categories, kind) =>
      categories.filter((category) => category.kind === kind && category.archivedAt === null).sort((a, b) => a.order - b.order)
  );
}

export function useCategories(kind: CategoryKind): Category[] {
  const selectCategoriesOfKind = useMemo(() => createCategoriesOfKindSelector(), []);
  return useAppSelector((state) => selectCategoriesOfKind(state.categories, kind));
}

export function useCategory(categoryId: string | undefined): Category | undefined {
  return useAppSelector((state) => (categoryId ? categoriesSelectors.selectById(state.categories, categoryId) : undefined));
}

export function getCategory(categoryId: string): Category | undefined {
  return categoriesSelectors.selectById(getState().categories, categoryId);
}

export type NewCategory = Omit<Category, 'id' | 'order' | 'archivedAt'>;

// Reads the full categories table into Redux at app startup (business-logic-plan.md, Step 9). In
// __DEV__, seeds the table from `mock-data.ts` first if it's still empty (Step 8) — a real build
// never seeds, it just starts with zero categories (docs/app-overview.md).
export async function hydrateCategories(): Promise<void> {
  const database = getDatabase();
  if (__DEV__) {
    const [firstRow] = await database.select({ id: categoriesTable.id }).from(categoriesTable).limit(1);
    if (!firstRow) {
      await database.insert(categoriesTable).values(mockCategories);
    }
  }
  const categories = await database.select().from(categoriesTable);
  dispatch(categoriesHydrated(categories));
}

// Write-through persistence (business-logic-plan.md, Step 10) — see `use-accounts.ts` for the
// rationale: optimistic Redux update first, background SQLite write second, failures logged and
// surfaced (Step 14) but never rolled back.
export async function createCategory(category: NewCategory): Promise<void> {
  const id = generateId('category');
  const categoriesOfKind = categoriesSelectors.selectAll(getState().categories).filter((c) => c.kind === category.kind);
  const maxOrder = Math.max(-1, ...categoriesOfKind.map((c) => c.order));
  const newCategory: Category = { ...category, id, order: maxOrder + 1, archivedAt: null };
  dispatch(categoryAdded(newCategory));
  try {
    await getDatabase().insert(categoriesTable).values(newCategory);
  } catch (error) {
    console.error('Failed to persist new category:', error);
    notifyWriteFailure();
  }
}

export async function updateCategory(
  categoryId: string,
  changes: Partial<Omit<Category, 'id' | 'kind' | 'order' | 'archivedAt'>>
): Promise<void> {
  dispatch(categoryUpdated({ id: categoryId, changes }));
  try {
    await getDatabase().update(categoriesTable).set(changes).where(eq(categoriesTable.id, categoryId));
  } catch (error) {
    console.error('Failed to persist category update:', error);
    notifyWriteFailure();
  }
}

export async function archiveCategory(categoryId: string): Promise<void> {
  const archivedAt = new Date().toISOString();
  dispatch(categoryUpdated({ id: categoryId, changes: { archivedAt } }));
  try {
    await getDatabase().update(categoriesTable).set({ archivedAt }).where(eq(categoriesTable.id, categoryId));
  } catch (error) {
    console.error('Failed to persist category archive:', error);
    notifyWriteFailure();
  }
}

export async function reorderCategories(kind: CategoryKind, orderedCategoryIds: string[]): Promise<void> {
  dispatch(categoriesReordered({ kind, orderedCategoryIds }));
  try {
    const database = getDatabase();
    const categoriesOfKind = categoriesSelectors
      .selectAll(getState().categories)
      .filter((category) => category.kind === kind);
    const orderByCategoryId = new Map(orderedCategoryIds.map((id, order) => [id, order]));
    await database.transaction(async (tx) => {
      for (const category of categoriesOfKind) {
        const order = orderByCategoryId.get(category.id);
        if (order !== undefined) {
          await tx.update(categoriesTable).set({ order }).where(eq(categoriesTable.id, category.id));
        }
      }
    });
  } catch (error) {
    console.error('Failed to persist category reorder:', error);
    notifyWriteFailure();
  }
}

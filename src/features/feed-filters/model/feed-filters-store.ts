import { createValueStore } from '@/shared/lib/create-value-store';
import type { TransactionType } from '@/entities/transaction';

export type FeedFilter = 'all' | TransactionType;
export type FeedPeriod = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface FeedFilters {
  type: FeedFilter;
  categoryId: string | null;
  accountId: string | null;
  period: FeedPeriod;
}

export const defaultFeedFilters: FeedFilters = {
  type: 'all',
  categoryId: null,
  accountId: null,
  period: 'all',
};

// No persistKey (business-logic-plan.md, Step 11): a working draft of the current Feed view, not
// a setting — persisting it would make a restarted app look like it silently lost transactions
// whenever the user had left a filter applied.
const feedFiltersStore = createValueStore<FeedFilters>(defaultFeedFilters);

export function useFeedFilters(): FeedFilters {
  return feedFiltersStore.useValue();
}

export function setFeedFilters(updater: FeedFilters | ((filters: FeedFilters) => FeedFilters)): void {
  feedFiltersStore.setValue(updater);
}

export function resetFeedFilters(): void {
  feedFiltersStore.setValue(defaultFeedFilters);
}

export function useIsFeedFiltersActive(): boolean {
  const filters = useFeedFilters();
  return (
    filters.type !== defaultFeedFilters.type ||
    filters.categoryId !== defaultFeedFilters.categoryId ||
    filters.accountId !== defaultFeedFilters.accountId ||
    filters.period !== defaultFeedFilters.period
  );
}

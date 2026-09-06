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

const feedFiltersStore = createValueStore<FeedFilters>(defaultFeedFilters);

export function useFeedFilters(): FeedFilters {
  return feedFiltersStore.useValue();
}

export function setFeedFilters(updater: FeedFilters | ((filters: FeedFilters) => FeedFilters)): void {
  feedFiltersStore.setValue(updater);
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

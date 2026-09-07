import { useCategories, type Category, type CategoryKind } from '@/entities/category';
import { useTransactions } from '@/entities/transaction';

export const frequentCategoriesLimit = 8;
const frequencyWindowInDays = 30;

export function useFrequentCategories(kind: CategoryKind): Category[] {
  const categories = useCategories(kind);
  const transactions = useTransactions();

  const windowStart = Date.now() - frequencyWindowInDays * 24 * 60 * 60 * 1000;
  const usageCountByCategoryId = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== kind) {
      continue;
    }
    if (new Date(transaction.date).getTime() < windowStart) {
      continue;
    }
    const previousCount = usageCountByCategoryId.get(transaction.categoryId) ?? 0;
    usageCountByCategoryId.set(transaction.categoryId, previousCount + 1);
  }

  return [...categories]
    .sort((a, b) => (usageCountByCategoryId.get(b.id) ?? 0) - (usageCountByCategoryId.get(a.id) ?? 0))
    .slice(0, frequentCategoriesLimit);
}

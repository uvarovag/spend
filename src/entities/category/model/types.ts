export type CategoryKind = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  order: number;
  archivedAt: string | null;
}

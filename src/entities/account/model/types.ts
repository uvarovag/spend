export type AccountType = 'cash' | 'card' | 'savings';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  color: string;
  archivedAt: string | null;
}

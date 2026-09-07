import { configureStore } from '@reduxjs/toolkit';

import { accountsReducer } from '@/entities/account';
import { categoriesReducer } from '@/entities/category';
import { transactionsReducer } from '@/entities/transaction';

import { registerStore } from './store-bridge';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

registerStore(store);

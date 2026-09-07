import { i18next } from '@/shared/i18n/i18n';

import { createValueStore } from './create-value-store';
import { generateId } from './generate-id';

export interface ErrorNotification {
  id: string;
  message: string;
}

// No persistKey: an ephemeral toast, never meant to survive a restart.
const errorNotificationStore = createValueStore<ErrorNotification | null>(null);

export function useErrorNotification(): ErrorNotification | null {
  return errorNotificationStore.useValue();
}

// Called from entities' write-through mutations (business-logic-plan.md, Step 14) when a
// background SQLite write fails. The already-applied optimistic Redux update is never rolled
// back — this only lets the user know their change may not have reached disk. The caller is
// responsible for `console.error`-logging the actual error (in English, per the project's
// error-text convention); this notification only carries the user-facing, localized message.
export function notifyWriteFailure(): void {
  errorNotificationStore.setValue({ id: generateId('error-notification'), message: i18next.t('errors.saveFailed') });
}

export function clearErrorNotification(): void {
  errorNotificationStore.setValue(null);
}

import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAccount } from '@/entities/account';
import { AccountFormFields } from '@/features/account-form';
import { ModalHeader } from '@/shared/ui/modal-header';

export function AccountFormScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingAccount = id ? getAccount(id) : undefined;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader
        title={existingAccount ? t('accounts.editTitle') : t('accounts.newTitle')}
        onClose={() => router.back()}
      />
      <AccountFormFields
        existingAccount={existingAccount}
        locale={i18n.language}
        onSaved={() => router.back()}
        onArchived={() => router.back()}
      />
    </SafeAreaView>
  );
}

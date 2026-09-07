import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { archiveAccount, createAccount, CURRENCY_CODES, getAccount, updateAccount, type AccountType } from '@/entities/account';
import { colorPresets } from '@/shared/lib/color-presets';
import { formatCurrency } from '@/shared/lib/format-currency';
import { parseAmount } from '@/shared/lib/parse-amount';
import { systemColors } from '@/shared/lib/system-colors';
import { ColorSwatchPicker } from '@/shared/ui/color-swatch-picker';
import { GlassButton } from '@/shared/ui/glass-button';
import { ModalHeader } from '@/shared/ui/modal-header';
import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

import { CurrencyPicker } from './currency-picker';

const accountTypes: AccountType[] = ['cash', 'card', 'savings'];

export function AccountFormScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingAccount = id ? getAccount(id) : undefined;

  const [name, setName] = useState(existingAccount?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [type, setType] = useState<AccountType>(existingAccount?.type ?? 'card');
  const [currency, setCurrency] = useState(existingAccount?.currency ?? CURRENCY_CODES[0]);
  const [initialBalanceText, setInitialBalanceText] = useState('');
  const [color, setColor] = useState(existingAccount?.color ?? colorPresets[0]);

  function handleChangeName(text: string) {
    setName(text);
    setNameError(null);
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setNameError(t('accounts.nameRequired'));
      return;
    }

    if (existingAccount) {
      void updateAccount(existingAccount.id, { name: trimmedName, type, color });
    } else {
      void createAccount({ name: trimmedName, type, currency, initialBalance: parseAmount(initialBalanceText), color });
    }
    router.back();
  }

  function handleArchive() {
    if (existingAccount) {
      void archiveAccount(existingAccount.id);
      router.back();
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader
        title={existingAccount ? t('accounts.editTitle') : t('accounts.newTitle')}
        onClose={() => router.back()}
      />
      <View className="flex-1">
        <ScrollView contentContainerClassName="gap-4 px-4 pb-40 pt-4">
          <View className="items-center gap-3">
            <View className="h-16 w-16 rounded-full" style={{ backgroundColor: color }} />
            <TextInput
              value={name}
              onChangeText={handleChangeName}
              placeholder={t('accounts.namePlaceholder')}
              placeholderTextColor={systemColors.gray}
              className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-center text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
            />
            {nameError && <Text className="text-xs text-[#FF3B30]">{nameError}</Text>}
          </View>

          <SegmentedSwitcher
            value={type}
            onChange={setType}
            options={accountTypes}
            getLabel={(accountType) => t(`accounts.type.${accountType}`)}
          />

          <View className="flex-row items-center gap-3">
            <View className="w-24 items-center justify-center rounded-xl bg-neutral-100 py-3 dark:bg-neutral-900">
              {existingAccount ? (
                <Text className="text-base text-neutral-500 dark:text-neutral-400">{currency}</Text>
              ) : (
                <CurrencyPicker value={currency} onChange={setCurrency} />
              )}
            </View>
            {existingAccount ? (
              <View className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-900">
                <Text className="text-lg text-neutral-500 dark:text-neutral-400">
                  {formatCurrency(existingAccount.initialBalance, currency, i18n.language)}
                </Text>
              </View>
            ) : (
              <TextInput
                value={initialBalanceText}
                onChangeText={setInitialBalanceText}
                placeholder={t('accounts.initialBalance')}
                placeholderTextColor={systemColors.gray}
                keyboardType="decimal-pad"
                className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-lg text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
              />
            )}
          </View>

          <View className="gap-2">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('accounts.color')}</Text>
            <ColorSwatchPicker colors={colorPresets} value={color} onChange={setColor} />
          </View>
        </ScrollView>

        <View className="absolute inset-x-0 bottom-0 gap-1 px-4 pb-4 pt-2">
          <GlassButton label={t('accounts.save')} onPress={handleSave} />
          {existingAccount && (
            <Pressable onPress={handleArchive} className="items-center py-3 active:opacity-70">
              <Text className="text-base font-medium text-[#FF3B30]">{t('accounts.archive')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

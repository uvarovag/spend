import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountFormFields } from '@/features/account-form';
import { CategoryFormFields } from '@/features/category-form';
import { completeOnboarding } from '@/features/onboarding';
import { systemColors } from '@/shared/lib/system-colors';
import { GlassButton } from '@/shared/ui/glass-button';
import { ModalHeader } from '@/shared/ui/modal-header';

const stepCount = 3;

function finishOnboarding() {
  completeOnboarding();
  router.replace('/');
}

function StepDots({ step }: { step: number }) {
  return (
    <View className="flex-row justify-center gap-2 pb-4">
      {Array.from({ length: stepCount }, (_, index) => (
        <View
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${index === step ? 'bg-[#007AFF]' : 'bg-neutral-300 dark:bg-neutral-700'}`}
        />
      ))}
    </View>
  );
}

function IntroRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <Ionicons name={icon} size={18} color={systemColors.blue} />
      </View>
      <Text className="flex-1 text-base text-neutral-700 dark:text-neutral-300">{text}</Text>
    </View>
  );
}

function StepTitle({ children }: { children: string }) {
  return <Text className="px-4 pb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">{children}</Text>;
}

// Step 1 is the only genuinely custom screen — there's no existing "explain the app" modal to
// reuse. Steps 2 and 3 embed the real account/category create forms (`features/account-form`,
// `features/category-form`) — the same components `pages/accounts`/`pages/categories` render in
// their own modals — instead of a second, parallel implementation of the same fields.
export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader onClose={finishOnboarding} closeLabel={t('onboarding.skip')} />
      <StepDots step={step} />

      {step === 0 && (
        <>
          <View className="flex-1 justify-center gap-4 px-4">
            <Text className="text-center text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {t('onboarding.step1.title')}
            </Text>
            <View className="gap-4">
              <IntroRow icon="wallet-outline" text={t('onboarding.step1.accounts')} />
              <IntroRow icon="pricetags-outline" text={t('onboarding.step1.categories')} />
              <IntroRow icon="flash-outline" text={t('onboarding.step1.transactions')} />
            </View>
          </View>
          <View className="px-4 pb-4 pt-2">
            <GlassButton label={t('onboarding.next')} onPress={() => setStep(1)} />
          </View>
        </>
      )}

      {step === 1 && (
        <>
          <StepTitle>{t('onboarding.step2.title')}</StepTitle>
          <AccountFormFields locale={i18n.language} onSaved={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <StepTitle>{t('onboarding.step3.title')}</StepTitle>
          <CategoryFormFields kind="expense" onSaved={finishOnboarding} />
        </>
      )}
    </SafeAreaView>
  );
}

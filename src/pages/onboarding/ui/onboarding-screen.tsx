import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountFormFields } from '@/features/account-form';
import { CategoryFormFields } from '@/features/category-form';
import { completeOnboarding } from '@/features/onboarding';
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

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <View className="gap-2 px-4 pb-4">
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{title}</Text>
      <Text className="text-base text-neutral-500 dark:text-neutral-400">{description}</Text>
    </View>
  );
}

// Every step is a real create form (`features/account-form`, `features/category-form`) — the same
// components `pages/accounts`/`pages/categories` render in their own modals — instead of a second,
// parallel implementation of the same fields. Each step opens with a short title + description
// explaining what the entity is and why it's needed, since a first-time user hasn't seen the app yet.
export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader onClose={finishOnboarding} closeLabel={t('onboarding.skip')} />
      <StepDots step={step} />

      {step === 0 && (
        <>
          <StepIntro title={t('onboarding.step1.title')} description={t('onboarding.step1.description')} />
          <AccountFormFields locale={i18n.language} onSaved={() => setStep(1)} />
        </>
      )}

      {step === 1 && (
        <>
          <StepIntro title={t('onboarding.step2.title')} description={t('onboarding.step2.description')} />
          <CategoryFormFields kind="income" onSaved={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <StepIntro title={t('onboarding.step3.title')} description={t('onboarding.step3.description')} />
          <CategoryFormFields kind="expense" onSaved={finishOnboarding} />
        </>
      )}
    </SafeAreaView>
  );
}

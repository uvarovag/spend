import { createValueStore } from '@/shared/lib/create-value-store';

// Persisted (business-logic-plan.md, Step 11 pattern): shown once on a genuinely first run, and
// must stay completed even if the user later deletes every account/category — re-triggering the
// whole welcome flow just because the data happens to be empty again would be surprising, not helpful.
const onboardingCompletedStore = createValueStore<boolean>(false, 'onboarding-completed');

export function useOnboardingCompleted(): boolean {
  return onboardingCompletedStore.useValue();
}

export function completeOnboarding(): void {
  onboardingCompletedStore.setValue(true);
}

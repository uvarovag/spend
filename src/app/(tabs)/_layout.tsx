import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { resetFeedFilters } from '@/features/feed-filters';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="chart.pie" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* Switching to the Feed from the tab bar always shows the full, unfiltered list. `tabPress`
          fires only on a user tap of the tab, not on programmatic navigation, so Home's "spent/income
          this month" cards can still push to a pre-filtered Feed (see goToFilteredFeed in
          home-screen.tsx). It also fires on a re-tap of the already-focused Feed tab, which must not
          wipe filters the user just set on that very screen — hence the focus guard. */}
      <NativeTabs.Trigger
        name="feed"
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (!navigation.isFocused()) {
              resetFeedFilters();
            }
          },
        })}
      >
        <NativeTabs.Trigger.Icon sf="list.bullet" />
        <NativeTabs.Trigger.Label>{t('tabs.feed')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape" />
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

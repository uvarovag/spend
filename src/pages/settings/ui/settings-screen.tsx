import { FieldGroup, Host, ListItem } from '@expo/ui';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguagePicker } from '@/features/change-language';
import { ThemePicker } from '@/features/change-theme';
import { systemColors } from '@/shared/lib/system-colors';
import { DisclosureChevron } from '@/shared/ui/disclosure-chevron';
import { IconBadge } from '@/shared/ui/icon-badge';

const chevron = <DisclosureChevron />;

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={[]} className="flex-1">
      <Stack.Screen options={{ headerShown: true, headerLargeTitle: true, title: t('tabs.settings') }} />
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <FieldGroup>
          <FieldGroup.Section>
            <ListItem
              leading={<IconBadge name="wallet-outline" backgroundColor={systemColors.green} />}
              trailing={chevron}
              onPress={() => router.push('/settings/accounts')}
            >
              {t('settings.accounts')}
            </ListItem>
            <ListItem
              leading={<IconBadge name="pricetags-outline" backgroundColor={systemColors.orange} />}
              trailing={chevron}
              onPress={() => router.push('/settings/categories')}
            >
              {t('settings.categories')}
            </ListItem>
          </FieldGroup.Section>

          <FieldGroup.Section>
            <ListItem
              leading={<IconBadge name="contrast-outline" backgroundColor={systemColors.gray2} />}
              trailing={<ThemePicker />}
            >
              {t('settings.theme.label')}
            </ListItem>
            <ListItem
              leading={<IconBadge name="language-outline" backgroundColor={systemColors.blue} />}
              trailing={<LanguagePicker />}
            >
              {t('settings.language.label')}
            </ListItem>
          </FieldGroup.Section>
        </FieldGroup>
      </Host>
    </SafeAreaView>
  );
}

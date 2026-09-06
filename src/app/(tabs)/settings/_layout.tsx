import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="accounts" />
      <Stack.Screen name="categories" />
    </Stack>
  );
}

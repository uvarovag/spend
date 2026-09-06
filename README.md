# Spend

Приложение для учёта расходов и доходов: счета в разных валютах, категории, лента операций и переводы между счетами.

## Стек

Expo SDK 57, TypeScript, Expo Router, NativeWind (Tailwind), FlashList, Victory Native XL, @expo/ui. Архитектура — Feature-Sliced Design, детали и правила в [AGENTS.md](./AGENTS.md).

## Запуск

```bash
npm install
npm start
```

- `npm run ios` — запуск в iOS-симуляторе
- `npm run web` — запуск веб-версии
- `npm run lint` — линт (`expo lint`)
- `npm run clean` — очистка кэшей Metro/Watchman/Expo и нативных build-директорий (`.expo`, `node_modules/.cache`, `ios/build`)
- `npm run build:ios` — сборка Release-версии и установка на подключённый по кабелю iPhone (`expo run:ios --configuration Release --device`, при запуске нужно выбрать устройство из списка)

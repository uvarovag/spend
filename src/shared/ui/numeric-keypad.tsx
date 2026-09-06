import { Pressable, Text, View } from 'react-native';

import { backspaceKey } from '@/shared/lib/keypad-input';

const keyRows = [
  ['7', '8', '9', 'backspace'],
  ['4', '5', '6', '/'],
  ['1', '2', '3', '*'],
  ['.', '0', '-', '+'],
];

const keyLabels: Record<string, string> = {
  backspace: backspaceKey,
  '/': '÷',
  '*': '×',
  '-': '−',
};

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  return (
    <View className="gap-2 px-4 pb-2">
      {keyRows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-2">
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => onKeyPress(key === 'backspace' ? backspaceKey : key)}
              className="flex-1 items-center justify-center rounded-2xl bg-neutral-100 py-5 active:bg-neutral-200 dark:bg-neutral-800 dark:active:bg-neutral-700"
            >
              <Text className="text-2xl font-medium text-neutral-900 dark:text-neutral-50">
                {keyLabels[key] ?? key}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

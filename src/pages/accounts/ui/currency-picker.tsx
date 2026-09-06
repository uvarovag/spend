import { Host, Picker } from '@expo/ui';

import { CURRENCY_CODES } from '@/entities/account';

interface CurrencyPickerProps {
  value: string;
  onChange: (currency: string) => void;
}

export function CurrencyPicker({ value, onChange }: CurrencyPickerProps) {
  return (
    <Host style={{ height: 24, width: 80 }}>
      <Picker appearance="menu" selectedValue={value} onValueChange={onChange}>
        {CURRENCY_CODES.map((code) => (
          <Picker.Item key={code} label={code} value={code} />
        ))}
      </Picker>
    </Host>
  );
}

import { currencySymbol } from '@/shared/lib/format-currency';
import { SegmentedSwitcher } from '@/shared/ui/segmented-switcher';

interface CurrencySwitcherProps {
  currencies: string[];
  value: string;
  onChange: (currency: string) => void;
  locale: string;
}

export function CurrencySwitcher({ currencies, value, onChange, locale }: CurrencySwitcherProps) {
  return (
    <SegmentedSwitcher
      value={value}
      onChange={onChange}
      options={currencies}
      getLabel={(currency) => currencySymbol(currency, locale)}
    />
  );
}

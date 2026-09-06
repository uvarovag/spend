import { Host, Picker, Text as HostText } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

interface SegmentedSwitcherProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  getLabel: (option: T) => string;
  width?: number;
}

export function SegmentedSwitcher<T extends string>({ value, onChange, options, getLabel, width }: SegmentedSwitcherProps<T>) {
  return (
    <Host style={{ height: 36, width }}>
      <Picker
        modifiers={[pickerStyle('segmented')]}
        selection={value}
        onSelectionChange={(selection) => onChange(selection as T)}
      >
        {options.map((option) => (
          <HostText key={option} modifiers={[tag(option)]}>
            {getLabel(option)}
          </HostText>
        ))}
      </Picker>
    </Host>
  );
}

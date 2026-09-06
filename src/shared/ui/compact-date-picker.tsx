import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

interface CompactDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function CompactDatePicker({ date, onDateChange }: CompactDatePickerProps) {
  return (
    <Host style={{ height: 32, width: 160, marginLeft: -24 }}>
      <DatePicker
        selection={date}
        displayedComponents={['date']}
        onDateChange={onDateChange}
        modifiers={[datePickerStyle('compact')]}
      />
    </Host>
  );
}

const MAX_ACCOUNT_NAME_LENGTH = 10;

// A long account name wraps a native menu-style Picker's closed-state label to multiple lines
// and breaks the fixed-height chip/row it sits in — neither lineLimit(1) nor a non-breaking
// separator reaches the native menu button's collapsed-state title in this @expo/ui version.
export function truncateAccountName(name: string): string {
  return name.length > MAX_ACCOUNT_NAME_LENGTH ? `${name.slice(0, MAX_ACCOUNT_NAME_LENGTH - 1)}…` : name;
}

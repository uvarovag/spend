import { Image } from '@expo/ui/swift-ui';

import { systemColors } from '@/shared/lib/system-colors';

// A bare RN vector-icon (e.g. Ionicons) as a ListItem accessory breaks the row's native
// SwiftUI sizing (huge blank row, headline disappears) — its glyph has no fixed layout size for
// the RNHostView `matchContents` measurement to latch onto. Use the native SF Symbol instead.
export function DisclosureChevron() {
  return <Image systemName="chevron.right" size={14} color={systemColors.gray3} />;
}

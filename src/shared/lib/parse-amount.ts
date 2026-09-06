export function parseAmount(text: string): number {
  return Number(text.replace(',', '.')) || 0;
}

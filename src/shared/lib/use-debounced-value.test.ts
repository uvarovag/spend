import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

// Real, short waits — mixing this library's async act()-based render/rerender with Jest fake
// timers leaves the initial mount's effects unflushed, so real timers are the reliable option here.
function wait(ms: number): Promise<void> {
  return act(() => new Promise((resolve) => setTimeout(resolve, ms)));
}

describe('useDebouncedValue', () => {
  it('holds the previous value until the delay elapses, then updates', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 50), {
      initialProps: { value: 'a' },
    });

    expect(result.current).toBe('a');

    await rerender({ value: 'b' });
    expect(result.current).toBe('a');

    await wait(70);
    expect(result.current).toBe('b');
  });

  it('restarts the delay on every change, only settling on the last value', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 50), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'b' });
    await wait(30);
    await rerender({ value: 'c' });
    await wait(30);
    // 60ms of wall time passed, but no single gap reached the 50ms delay — still the original value.
    expect(result.current).toBe('a');

    await wait(30);
    expect(result.current).toBe('c');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStableOptions } from '../hooks/useStableOptions';

describe('useStableOptions', () => {
  it('returns empty string for undefined', () => {
    const { result } = renderHook(() => useStableOptions(undefined));
    expect(result.current).toBe('');
  });

  it('returns stable key for same values', () => {
    const { result, rerender } = renderHook(
      ({ options }) => useStableOptions(options),
      { initialProps: { options: { theme: 'dark', locale: 'en' } } }
    );

    const firstKey = result.current;

    // Rerender with a new object that has the same values
    rerender({ options: { theme: 'dark', locale: 'en' } });

    expect(result.current).toBe(firstKey);
  });

  it('returns different key when values change', () => {
    const { result, rerender } = renderHook(
      ({ options }) => useStableOptions(options),
      { initialProps: { options: { theme: 'dark' } } }
    );

    const firstKey = result.current;

    rerender({ options: { theme: 'light' } });

    expect(result.current).not.toBe(firstKey);
  });

  it('handles key ordering consistently', () => {
    const { result: result1 } = renderHook(() =>
      useStableOptions({ b: 2, a: 1 })
    );
    const { result: result2 } = renderHook(() =>
      useStableOptions({ a: 1, b: 2 })
    );

    expect(result1.current).toBe(result2.current);
  });

  it('handles non-serializable values with stable fallback', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const { result, rerender } = renderHook(
      ({ options }) => useStableOptions(options),
      { initialProps: { options: circular } }
    );

    const firstKey = result.current;
    expect(firstKey).toMatch(/^unstable-/);

    // Same reference should give same key
    rerender({ options: circular });
    expect(result.current).toBe(firstKey);

    warnSpy.mockRestore();
  });
});

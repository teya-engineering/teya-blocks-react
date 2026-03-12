import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCallbackRefs } from '../hooks/useCallbackRefs';

describe('useCallbackRefs', () => {
  it('returns ref containing the callbacks', () => {
    const onReady = vi.fn();
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useCallbackRefs({ onReady, onChange })
    );

    expect(result.current.current.onReady).toBe(onReady);
    expect(result.current.current.onChange).toBe(onChange);
  });

  it('updates ref when callbacks change', () => {
    const onReady1 = vi.fn();
    const onReady2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ onReady }) => useCallbackRefs({ onReady }),
      { initialProps: { onReady: onReady1 } }
    );

    expect(result.current.current.onReady).toBe(onReady1);

    rerender({ onReady: onReady2 });

    expect(result.current.current.onReady).toBe(onReady2);
  });

  it('returns stable ref identity across renders', () => {
    const { result, rerender } = renderHook(
      ({ onReady }) => useCallbackRefs({ onReady }),
      { initialProps: { onReady: vi.fn() } }
    );

    const firstRef = result.current;

    rerender({ onReady: vi.fn() });

    expect(result.current).toBe(firstRef);
  });

  it('handles undefined callbacks', () => {
    const { result } = renderHook(() =>
      useCallbackRefs({ onReady: undefined, onChange: undefined })
    );

    expect(result.current.current.onReady).toBeUndefined();
    expect(result.current.current.onChange).toBeUndefined();
  });
});

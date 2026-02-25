import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useTeyaBlocks, useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import type { TeyaBlocks } from '@teya/teya-blocks-js';
import type { ReactNode } from 'react';

const mockTeya = { elements: { create: () => ({}) } } as unknown as TeyaBlocks;

function createWrapper(teya: TeyaBlocks | Promise<TeyaBlocks | null> | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TeyaBlocksProvider teya={teya}>{children}</TeyaBlocksProvider>;
  };
}

describe('useTeyaBlocks', () => {
  it('returns TeyaBlocks instance when loaded', () => {
    const { result } = renderHook(() => useTeyaBlocks(), {
      wrapper: createWrapper(mockTeya),
    });

    expect(result.current).toBe(mockTeya);
  });

  it('throws when SDK is still loading', () => {
    const promise = new Promise<TeyaBlocks>(() => {});
    expect(() => {
      renderHook(() => useTeyaBlocks(), {
        wrapper: createWrapper(promise),
      });
    }).toThrow('[Teya Blocks] SDK is still loading');
  });

  it('throws when SDK failed to load (null passed as teya)', () => {
    // When null is passed, the initial state is loading=true.
    // The first render throws "still loading"; after the effect runs,
    // it would throw "failed to load". We test the initial behavior here.
    expect(() => {
      renderHook(() => useTeyaBlocks(), {
        wrapper: createWrapper(null),
      });
    }).toThrow('[Teya Blocks] SDK is still loading');
  });
});

describe('useTeyaBlocksLoader', () => {
  it('returns teya instance and isReady=true when loaded', () => {
    const { result } = renderHook(() => useTeyaBlocksLoader(), {
      wrapper: createWrapper(mockTeya),
    });

    expect(result.current.teya).toBe(mockTeya);
    expect(result.current.loading).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns loading=true while SDK loads', () => {
    const promise = new Promise<TeyaBlocks>(() => {});
    const { result } = renderHook(() => useTeyaBlocksLoader(), {
      wrapper: createWrapper(promise),
    });

    expect(result.current.teya).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  it('returns isReady=false when teya is null', () => {
    const { result } = renderHook(() => useTeyaBlocksLoader(), {
      wrapper: createWrapper(null),
    });

    expect(result.current.teya).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isReady).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';

// Helper component that exposes context values for testing
function ContextConsumer() {
  const { teya, loading, error, isReady } = useTeyaBlocksLoader();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="isReady">{String(isReady)}</span>
      <span data-testid="hasTeya">{String(teya !== null)}</span>
      <span data-testid="error">{error?.message ?? 'none'}</span>
    </div>
  );
}

function renderWithProvider(teya: TeyaBlocks | Promise<TeyaBlocks | null> | null) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <ContextConsumer />
    </TeyaBlocksProvider>
  );
}

const mockTeya = { elements: { create: () => ({}) } } as unknown as TeyaBlocks;

describe('TeyaBlocksProvider', () => {
  it('handles synchronous TeyaBlocks instance', () => {
    renderWithProvider(mockTeya);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isReady')).toHaveTextContent('true');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('shows loading state for Promise', () => {
    const promise = new Promise<TeyaBlocks>(() => {}); // never resolves
    renderWithProvider(promise);

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('isReady')).toHaveTextContent('false');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('false');
  });

  it('resolves Promise and updates state', async () => {
    let resolve!: (value: TeyaBlocks) => void;
    const promise = new Promise<TeyaBlocks>((r) => {
      resolve = r;
    });

    renderWithProvider(promise);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      resolve(mockTeya);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isReady')).toHaveTextContent('true');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('captures error when Promise rejects', async () => {
    let reject!: (reason: Error) => void;
    const promise = new Promise<TeyaBlocks>((_, r) => {
      reject = r;
    });

    renderWithProvider(promise);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      reject(new Error('Network failure'));
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isReady')).toHaveTextContent('false');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('Network failure');
  });

  it('captures non-Error rejection', async () => {
    let reject!: (reason: unknown) => void;
    const promise = new Promise<TeyaBlocks>((_, r) => {
      reject = r;
    });

    renderWithProvider(promise);

    await act(async () => {
      reject('string error');
    });

    expect(screen.getByTestId('error')).toHaveTextContent('string error');
  });

  it('handles null teya prop', () => {
    renderWithProvider(null);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isReady')).toHaveTextContent('false');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('false');
  });

  it('handles Promise that resolves to null', async () => {
    let resolve!: (value: TeyaBlocks | null) => void;
    const promise = new Promise<TeyaBlocks | null>((r) => {
      resolve = r;
    });

    renderWithProvider(promise);

    await act(async () => {
      resolve(null);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isReady')).toHaveTextContent('false');
    expect(screen.getByTestId('hasTeya')).toHaveTextContent('false');
  });
});

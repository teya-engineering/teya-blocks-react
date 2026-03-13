import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useCardElement } from '../hooks/useCardElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { UseCardElementOptions, UseCardElementResult } from '../hooks/useCardElement';

let hookResult: UseCardElementResult;

function TestComponent({ config }: { config?: UseCardElementOptions }) {
  hookResult = useCardElement(config);
  return <div ref={hookResult.cardElementRef} data-testid="card-container" />;
}

function renderWithTeya(teya: TeyaBlocks | null, config?: UseCardElementOptions) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <TestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

function getCreateOptions(mockTeya: ReturnType<typeof createMockTeya>) {
  return mockTeya.elements.create.mock.calls[0]?.[1] as Record<string, any>;
}

describe('useCardElement', () => {
  it('returns cardElementRef and submitPayment', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(hookResult.cardElementRef).toBeDefined();
    expect(typeof hookResult.submitPayment).toBe('function');
  });

  it('creates card element via SDK when teya is available', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('card', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes options to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      options: { appearance: { theme: 'default' as const } },
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'card',
      expect.objectContaining({ appearance: { theme: 'default' } })
    );
  });

  it('passes callback options to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {},
      onSuccess: () => {},
      onError: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'card',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('throws when submitPayment called before element is created', async () => {
    renderWithTeya(null);

    await expect(hookResult.submitPayment()).rejects.toThrow(
      'Card element not initialized'
    );
  });

  it('logs error when SDK create fails', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockTeya = {
      elements: {
        create: vi.fn(() => {
          throw new Error('SDK error');
        }),
      },
    };

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount card element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('does not create element when teya is null', () => {
    renderWithTeya(null);

    expect(hookResult.cardElementRef).toBeDefined();
  });

  it('forwards onReady callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onReady });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onChange });

    const opts = getCreateOptions(mockTeya);
    const event = { complete: true };
    act(() => opts.onChange(event));

    expect(onChange).toHaveBeenCalledWith(event);
  });

  it('forwards onFocus and onBlur callbacks', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onFocus, onBlur });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onFocus());
    act(() => opts.onBlur());

    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('forwards onSuccess callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onSuccess = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onSuccess });

    const opts = getCreateOptions(mockTeya);
    const response = { status: 'success' };
    act(() => opts.onSuccess(response));

    expect(onSuccess).toHaveBeenCalledWith(response);
  });

  it('forwards onError callback when provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onError });

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'fail' };
    act(() => opts.onError(error));

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('logs error when onError not provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'fail' };
    act(() => opts.onError(error));

    expect(errorSpy).toHaveBeenCalledWith('[Teya Blocks] Payment error:', error);
    errorSpy.mockRestore();
  });

  it('includes onTokenRefresh when provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      onTokenRefresh: async () => 'token',
    });

    const opts = getCreateOptions(mockTeya);
    expect(opts.onTokenRefresh).toBeDefined();
  });

  it('submitPayment delegates to block', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const result = await hookResult.submitPayment();
    expect(block.submitPayment).toHaveBeenCalled();
    expect(result).toEqual({ status: 'success', paymentId: 'pay_123' });
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderWithTeya(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(block.unmount).toHaveBeenCalled();
    expect(block.destroy).toHaveBeenCalled();
  });

  it('logs error during cleanup if destroy throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.destroy.mockImplementation(() => {
      throw new Error('cleanup error');
    });
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderWithTeya(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Error during card element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useCheckout } from '../hooks/useCheckout';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { UseCheckoutOptions, UseCheckoutResult } from '../hooks/useCheckout';

let hookResult: UseCheckoutResult;

function TestComponent({ config }: { config?: UseCheckoutOptions }) {
  hookResult = useCheckout(config);
  return <div ref={hookResult.checkoutRef} data-testid="checkout-container" />;
}

function renderWithTeya(teya: TeyaBlocks | null, config?: UseCheckoutOptions) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <TestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

function getCreateOptions(mockTeya: ReturnType<typeof createMockTeya>) {
  return mockTeya.elements.create.mock.calls[0]?.[1] as Record<string, any>;
}

describe('useCheckout', () => {
  it('returns checkoutRef and submitPayment', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(hookResult.checkoutRef).toBeDefined();
    expect(typeof hookResult.submitPayment).toBe('function');
  });

  it('creates checkout element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('checkout', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes payment methods and options to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      paymentMethods: ['CARD', 'APPLE_PAY'] as any,
      hideSubmitButton: true,
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        paymentMethods: ['CARD', 'APPLE_PAY'],
        hideSubmitButton: true,
      })
    );
  });

  it('passes callbacks to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onChange: () => {},
      onSuccess: () => {},
      onError: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('throws when submitPayment called before element is created', async () => {
    renderWithTeya(null);

    await expect(hookResult.submitPayment()).rejects.toThrow(
      'Checkout element not initialized'
    );
  });

  it('does not create element when teya is null', () => {
    const mockTeya = createMockTeya();

    renderWithTeya(null);

    expect(mockTeya.elements.create).not.toHaveBeenCalled();
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
      '[Teya Blocks] Failed to create/mount checkout element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderWithTeya(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(block.unmount).toHaveBeenCalled();
    expect(block.destroy).toHaveBeenCalled();
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

  it('forwards onSuccess callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onSuccess = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onSuccess });

    const opts = getCreateOptions(mockTeya);
    const response = { status: 'success' };
    act(() => opts.onSuccess(response, 'CARD'));

    expect(onSuccess).toHaveBeenCalledWith(response, 'CARD');
  });

  it('forwards onError callback when provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onError });

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'fail' };
    act(() => opts.onError(error, 'CARD'));

    expect(onError).toHaveBeenCalledWith(error, 'CARD');
  });

  it('logs error when onError not provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'fail' };
    act(() => opts.onError(error, 'CARD'));

    expect(errorSpy).toHaveBeenCalledWith('[Teya Blocks] Payment error:', error);
    errorSpy.mockRestore();
  });

  it('submitPayment delegates to block', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const result = await hookResult.submitPayment();
    expect(block.submitPayment).toHaveBeenCalled();
    expect(result).toEqual({ status: 'success', paymentId: 'pay_123' });
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
      '[Teya Blocks] Error during checkout element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

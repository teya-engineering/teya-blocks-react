import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useApplePay } from '../hooks/useApplePay';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { UseApplePayOptions, UseApplePayResult } from '../hooks/useApplePay';

let hookResult: UseApplePayResult;

function TestComponent({ config }: { config?: UseApplePayOptions }) {
  hookResult = useApplePay(config);
  return <div ref={hookResult.applePayElementRef} data-testid="apple-pay-container" />;
}

function renderWithTeya(teya: TeyaBlocks | null, config?: UseApplePayOptions) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <TestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

function getCreateOptions(mockTeya: ReturnType<typeof createMockTeya>) {
  return mockTeya.elements.create.mock.calls[0]?.[1] as Record<string, any>;
}

describe('useApplePay', () => {
  it('returns applePayElementRef, isAvailable, and submit', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(hookResult.applePayElementRef).toBeDefined();
    expect(hookResult.isAvailable).toBeNull();
    expect(typeof hookResult.submit).toBe('function');
  });

  it('creates applePay element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('applePay', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes options to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      options: { buttonType: 'buy', buttonStyle: 'black' },
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'applePay',
      expect.objectContaining({ buttonType: 'buy', buttonStyle: 'black' })
    );
  });

  it('passes callbacks to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onClick: () => {},
      onPaymentCompleted: () => {},
      onCancel: () => {},
      onError: () => {},
      onChange: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'applePay',
      expect.objectContaining({
        onReady: expect.any(Function),
        onClick: expect.any(Function),
        onPaymentCompleted: expect.any(Function),
        onCancel: expect.any(Function),
        onError: expect.any(Function),
        onChange: expect.any(Function),
      })
    );
  });

  it('throws when submit called before element is created', async () => {
    renderWithTeya(null);

    await expect(
      hookResult.submit({
        countryCode: 'US',
        currencyCode: 'USD',
        total: { label: 'Store', amount: '10.00' },
      } as any)
    ).rejects.toThrow('Apple Pay element not initialized');
  });

  it('does not create element when teya is null', () => {
    renderWithTeya(null);

    expect(hookResult.applePayElementRef).toBeDefined();
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
      '[Teya Blocks] Failed to create/mount Apple Pay element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('sets isAvailable and calls onReady when canMakePayments resolves', async () => {
    const { block } = createMockBlock();
    block.canMakePayments.mockResolvedValue(true);
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onReady });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onReady());

    expect(onReady).toHaveBeenCalled();
    expect(hookResult.isAvailable).toBe(true);
  });

  it('sets isAvailable to false when canMakePayments throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.canMakePayments.mockRejectedValue(new Error('Not supported'));
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onReady());

    expect(hookResult.isAvailable).toBe(false);
    errorSpy.mockRestore();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onChange });

    const opts = getCreateOptions(mockTeya);
    const event = { available: true };
    act(() => opts.onChange(event));

    expect(onChange).toHaveBeenCalledWith(event);
  });

  it('forwards onClick callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onClick = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onClick });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onClick());

    expect(onClick).toHaveBeenCalled();
  });

  it('forwards onCancel callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onCancel = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onCancel });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onCancel());

    expect(onCancel).toHaveBeenCalled();
  });

  it('forwards onPaymentCompleted callback', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onPaymentCompleted = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onPaymentCompleted });

    const opts = getCreateOptions(mockTeya);
    const result = { status: 'SUCCESS' };
    await act(async () => opts.onPaymentCompleted(result));

    expect(onPaymentCompleted).toHaveBeenCalledWith(result);
  });

  it('calls onError when onPaymentCompleted throws', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();
    const onPaymentCompleted = vi.fn().mockRejectedValue(new Error('handler error'));

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onPaymentCompleted, onError });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onPaymentCompleted({ status: 'SUCCESS' }));

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'handler error' }));
  });

  it('logs error when onPaymentCompleted throws and no onError provided', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onPaymentCompleted = vi.fn().mockRejectedValue(new Error('handler error'));

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onPaymentCompleted });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onPaymentCompleted({ status: 'SUCCESS' }));

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Apple Pay payment error:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });

  it('forwards onError from SDK error callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    renderWithTeya(mockTeya as unknown as TeyaBlocks, { onError });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onError({ message: 'Apple Pay error' }));

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Apple Pay error' }));
  });

  it('logs error from SDK error callback when no onError provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onError({ message: 'Apple Pay error' }));

    expect(errorSpy).toHaveBeenCalledWith('[Teya Blocks] Apple Pay error:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('submit delegates to createPaymentMethod', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderWithTeya(mockTeya as unknown as TeyaBlocks);

    const paymentRequest = { countryCode: 'US', currencyCode: 'USD', total: { label: 'Store', amount: '10.00' } } as any;
    const result = await hookResult.submit(paymentRequest);

    expect(block.createPaymentMethod).toHaveBeenCalledWith(paymentRequest);
    expect(result).toEqual({ status: 'SUCCESS', paymentId: 'pay_123' });
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
      '[Teya Blocks] Error during Apple Pay element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { ApplePayElement } from '../components/ApplePayElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { ReactNode } from 'react';

function createWrapper(teya: TeyaBlocks | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TeyaBlocksProvider teya={teya}>{children}</TeyaBlocksProvider>;
  };
}

function getCreateOptions(mockTeya: ReturnType<typeof createMockTeya>) {
  return mockTeya.elements.create.mock.calls[0]?.[1] as Record<string, any>;
}

describe('ApplePayElement', () => {
  it('renders container with correct aria attributes', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-label', 'Pay with Apple Pay');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('creates applePay element type via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('applePay', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <ApplePayElement
        onReady={() => {}}
        onClick={() => {}}
        onPaymentCompleted={() => {}}
        onCancel={() => {}}
        onError={() => {}}
        onChange={() => {}}
      />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

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

  it('merges paymentRequest into options', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const paymentRequest = {
      countryCode: 'US',
      currencyCode: 'USD',
      total: { label: 'Store', amount: '10.00' },
    };

    render(<ApplePayElement paymentRequest={paymentRequest} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'applePay',
      expect.objectContaining({ paymentRequest })
    );
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    unmount();
    expect(block.unmount).toHaveBeenCalled();
    expect(block.destroy).toHaveBeenCalled();
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

    render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount Apple Pay element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('applies className and style', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <ApplePayElement className="apple-pay" style={{ margin: '10px' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('apple-pay');
    expect(wrapper.style.margin).toBe('10px');
  });

  it('does not create element when teya is null', () => {
    render(<ApplePayElement />, {
      wrapper: createWrapper(null),
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('warns when autoSubmit is true but paymentRequest is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<ApplePayElement autoSubmit />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('autoSubmit is enabled but paymentRequest is not provided')
    );

    warnSpy.mockRestore();
  });

  it('sets available to true and calls onReady when canMakePayments resolves true', async () => {
    const { block } = createMockBlock();
    block.canMakePayments.mockResolvedValue(true);
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    render(<ApplePayElement onReady={onReady} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('renders null when available is false', async () => {
    const { block } = createMockBlock();
    block.canMakePayments.mockResolvedValue(false);
    const mockTeya = createMockTeya({ block });

    const { container } = render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onReady());

    expect(container.innerHTML).toBe('');
  });

  it('sets available to false when canMakePayments throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.canMakePayments.mockRejectedValue(new Error('Not supported'));
    const mockTeya = createMockTeya({ block });

    const { container } = render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onReady());

    expect(container.innerHTML).toBe('');
    errorSpy.mockRestore();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    render(<ApplePayElement onChange={onChange} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const event = { available: true };
    act(() => opts.onChange(event));

    expect(onChange).toHaveBeenCalledWith(event);
  });

  it('forwards onClick callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onClick = vi.fn();

    render(<ApplePayElement onClick={onClick} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onClick());

    expect(onClick).toHaveBeenCalled();
  });

  it('forwards onCancel callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onCancel = vi.fn();

    render(<ApplePayElement onCancel={onCancel} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onCancel());

    expect(onCancel).toHaveBeenCalled();
  });

  it('forwards onPaymentCompleted callback', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onPaymentCompleted = vi.fn();

    render(<ApplePayElement onPaymentCompleted={onPaymentCompleted} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const result = { status: 'SUCCESS', paymentId: 'pay_123' };
    await act(async () => opts.onPaymentCompleted(result));

    expect(onPaymentCompleted).toHaveBeenCalledWith(result);
  });

  it('calls onError when onPaymentCompleted throws', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();
    const onPaymentCompleted = vi.fn().mockRejectedValue(new Error('handler error'));

    render(<ApplePayElement onPaymentCompleted={onPaymentCompleted} onError={onError} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onPaymentCompleted({ status: 'SUCCESS' }));

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'handler error' }));
  });

  it('forwards onError from SDK error callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    render(<ApplePayElement onError={onError} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onError({ message: 'Apple Pay error' }));

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Apple Pay error' }));
  });

  it('logs SDK error when no onError callback provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onError({ message: 'Apple Pay error' }));

    expect(errorSpy).toHaveBeenCalledWith('[Teya Blocks] Apple Pay error:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('handles autoSubmit with paymentRequest on click', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const paymentRequest = {
      countryCode: 'US',
      currencyCode: 'USD',
      total: { label: 'Store', amount: '10.00' },
    };

    render(<ApplePayElement autoSubmit paymentRequest={paymentRequest} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onClick());

    expect(block.createPaymentMethod).toHaveBeenCalledWith(paymentRequest);
  });

  it('calls onError when autoSubmit has no paymentRequest', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    render(<ApplePayElement autoSubmit onError={onError} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    await act(async () => opts.onClick());

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Payment request is required' })
    );
    warnSpy.mockRestore();
  });

  it('logs error during cleanup if destroy throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.unmount.mockImplementation(() => {
      throw new Error('cleanup error');
    });
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<ApplePayElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    unmount();
    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Error during Apple Pay element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

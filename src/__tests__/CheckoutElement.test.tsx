import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { CheckoutElement, type CheckoutElementRef } from '../components/CheckoutElement';
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

describe('CheckoutElement', () => {
  it('renders loading skeleton initially', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(screen.getByLabelText('Loading card number input')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading digital wallet buttons')).toBeInTheDocument();
  });

  it('creates checkout element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('checkout', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <CheckoutElement
        onReady={() => {}}
        onChange={() => {}}
        onSuccess={() => {}}
        onError={() => {}}
      />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

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

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    unmount();
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

    render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount checkout element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('applies className and style', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <CheckoutElement className="checkout" style={{ padding: '20px' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('checkout');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('exposes submitPayment via ref', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const ref = createRef<CheckoutElementRef>();

    render(<CheckoutElement ref={ref} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.submitPayment).toBe('function');
  });

  it('throws when submitPayment called before initialization', async () => {
    const ref = createRef<CheckoutElementRef>();

    render(<CheckoutElement ref={ref} />, {
      wrapper: createWrapper(null),
    });

    await expect(ref.current?.submitPayment()).rejects.toThrow(
      'Checkout element not initialized'
    );
  });

  it('does not create element when teya is null', () => {
    const mockTeya = createMockTeya();
    render(<CheckoutElement />, {
      wrapper: createWrapper(null),
    });

    expect(mockTeya.elements.create).not.toHaveBeenCalled();
  });

  it('passes containerStyles to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <CheckoutElement
        containerStyles={{
          card: { minHeight: '100px' },
          applePay: { marginTop: '16px' },
        }}
      />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        cardContainerStyle: expect.objectContaining({ 'min-height': '100px' }),
        applePayContainerStyle: expect.objectContaining({ 'margin-top': '16px' }),
      })
    );
  });

  it('passes submitButtonProps to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <CheckoutElement
        submitButtonProps={{
          buttonText: 'Pay Now',
          buttonAmount: '$10.00',
        }}
      />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        submitButtonProps: expect.objectContaining({
          buttonText: 'Pay Now',
          buttonAmount: '$10.00',
        }),
      })
    );
  });

  it('hides loading skeleton when onReady fires', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    render(<CheckoutElement onReady={onReady} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
    expect(screen.queryByLabelText('Loading card number input')).not.toBeInTheDocument();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    render(<CheckoutElement onChange={onChange} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const event = { complete: true };
    act(() => opts.onChange(event));

    expect(onChange).toHaveBeenCalledWith(event);
  });

  it('forwards onSuccess callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onSuccess = vi.fn();

    render(<CheckoutElement onSuccess={onSuccess} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const response = { status: 'success', paymentId: 'pay_123' };
    act(() => opts.onSuccess(response, 'CARD'));

    expect(onSuccess).toHaveBeenCalledWith(response, 'CARD');
  });

  it('forwards onError callback when provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onError = vi.fn();

    render(<CheckoutElement onError={onError} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'Payment failed' };
    act(() => opts.onError(error, 'CARD'));

    expect(onError).toHaveBeenCalledWith(error, 'CARD');
  });

  it('logs error when onError not provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const error = { message: 'Payment failed' };
    act(() => opts.onError(error, 'CARD'));

    expect(errorSpy).toHaveBeenCalledWith('[Teya Blocks] Payment error:', error);
    errorSpy.mockRestore();
  });

  it('includes onTokenRefresh when provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CheckoutElement onTokenRefresh={async () => 'new-token'} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    expect(opts.onTokenRefresh).toBeDefined();
  });

  it('does not include onTokenRefresh when not provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    expect(opts.onTokenRefresh).toBeUndefined();
  });

  it('calls onTokenRefresh and returns result', async () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onTokenRefresh = vi.fn().mockResolvedValue('refreshed-token');

    render(<CheckoutElement onTokenRefresh={onTokenRefresh} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    const result = await opts.onTokenRefresh();

    expect(onTokenRefresh).toHaveBeenCalled();
    expect(result).toBe('refreshed-token');
  });

  it('converts submitButtonProps style to kebab-case', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <CheckoutElement
        submitButtonProps={{
          buttonText: 'Pay',
          style: { backgroundColor: 'blue', fontSize: 16 },
        }}
      />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        submitButtonProps: expect.objectContaining({
          style: expect.objectContaining({
            'background-color': 'blue',
            'font-size': '16px',
          }),
        }),
      })
    );
  });

  it('logs error during cleanup if destroy throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.destroy.mockImplementation(() => {
      throw new Error('cleanup error');
    });
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CheckoutElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    unmount();
    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Error during checkout element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });

  it('uses deprecated cardStyle when containerStyles.card not provided', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(
      <CheckoutElement cardStyle={{ minHeight: '80px' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'checkout',
      expect.objectContaining({
        cardContainerStyle: expect.objectContaining({ 'min-height': '80px' }),
      })
    );
  });
});

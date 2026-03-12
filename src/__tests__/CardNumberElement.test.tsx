import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { CardNumberElement } from '../components/CardNumberElement';
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

describe('CardNumberElement', () => {
  it('renders with correct aria label', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardNumberElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(screen.getByLabelText('Card number')).toBeInTheDocument();
  });

  it('creates cardNumber element type via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardNumberElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardNumber', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardNumberElement onReady={() => {}} onChange={() => {}} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardNumber',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
      })
    );
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CardNumberElement />, {
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

    render(<CardNumberElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount CardNumberElement:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('applies className and style to container', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <CardNumberElement className="my-card-number" style={{ border: '1px solid blue' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-card-number');
    expect(wrapper.style.border).toBe('1px solid blue');
  });

  it('does not create element when teya is null', () => {
    render(<CardNumberElement />, {
      wrapper: createWrapper(null),
    });

    expect(screen.getByLabelText('Card number')).toBeInTheDocument();
  });

  it('has correct display name', () => {
    expect(CardNumberElement.displayName).toBe('CardNumberElement');
  });

  it('forwards onReady callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    render(<CardNumberElement onReady={onReady} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    render(<CardNumberElement onChange={onChange} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

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

    render(<CardNumberElement onFocus={onFocus} onBlur={onBlur} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onFocus());
    act(() => opts.onBlur());

    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('logs error during cleanup if destroy throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { block } = createMockBlock();
    block.destroy.mockImplementation(() => {
      throw new Error('cleanup error');
    });
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CardNumberElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    unmount();
    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Error during CardNumberElement cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { CardCvcElement } from '../components/CardCvcElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { ReactNode } from 'react';

function createWrapper(teya: TeyaBlocks | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TeyaBlocksProvider teya={teya}>{children}</TeyaBlocksProvider>;
  };
}

describe('CardCvcElement', () => {
  it('renders with correct aria label', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardCvcElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(screen.getByLabelText('Card security code')).toBeInTheDocument();
  });

  it('creates cardCvc element type via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardCvcElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardCvc', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardCvcElement onReady={() => {}} onChange={() => {}} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardCvc',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
      })
    );
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CardCvcElement />, {
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

    render(<CardCvcElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount CardCvcElement:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('applies className and style', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <CardCvcElement className="cvc" style={{ width: '30%' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('cvc');
    expect(wrapper.style.width).toBe('30%');
  });

  it('has correct display name', () => {
    expect(CardCvcElement.displayName).toBe('CardCvcElement');
  });
});

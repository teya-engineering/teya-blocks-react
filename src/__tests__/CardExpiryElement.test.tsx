import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { CardExpiryElement } from '../components/CardExpiryElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { ReactNode } from 'react';

function createWrapper(teya: TeyaBlocks | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TeyaBlocksProvider teya={teya}>{children}</TeyaBlocksProvider>;
  };
}

describe('CardExpiryElement', () => {
  it('renders with correct aria label', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardExpiryElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(screen.getByLabelText('Card expiry date')).toBeInTheDocument();
  });

  it('creates cardExpiry element type via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardExpiryElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardExpiry', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardExpiryElement onReady={() => {}} onChange={() => {}} onFocus={() => {}} onBlur={() => {}} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardExpiry',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
      })
    );
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CardExpiryElement />, {
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

    render(<CardExpiryElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount CardExpiryElement:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('applies className and style', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <CardExpiryElement className="expiry" style={{ width: '50%' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('expiry');
    expect(wrapper.style.width).toBe('50%');
  });

  it('has correct display name', () => {
    expect(CardExpiryElement.displayName).toBe('CardExpiryElement');
  });
});

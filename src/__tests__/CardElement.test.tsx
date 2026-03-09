import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { CardElement } from '../components/CardElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { ReactNode } from 'react';

function createWrapper(teya: TeyaBlocks | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TeyaBlocksProvider teya={teya}>{children}</TeyaBlocksProvider>;
  };
}

describe('CardElement', () => {
  it('renders loading skeleton initially', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(screen.getByLabelText('Loading card number input')).toBeInTheDocument();
  });

  it('creates and mounts card element when teya is available', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith('card', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callback options to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    render(<CardElement onReady={() => {}} onChange={() => {}} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'card',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
      })
    );
  });

  it('does not render when teya is null (loading)', () => {
    render(<CardElement />, {
      wrapper: createWrapper(null),
    });

    // Card info container should still render (for the loading skeleton)
    expect(screen.getByLabelText('Card information')).toBeInTheDocument();
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = render(<CardElement />, {
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

    render(<CardElement />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount card element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('passes options to SDK create call', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    // Replace with a valid CardElementOptions property, e.g., style
    const options = { appearance: { theme: 'default' as const } };

    render(<CardElement options={options} />, {
      wrapper: createWrapper(mockTeya as unknown as TeyaBlocks),
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'card',
      expect.objectContaining({ appearance: { theme: 'default' } })
    );
  });

  it('applies className and style to container', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { container } = render(
      <CardElement className="my-card" style={{ border: '1px solid red' }} />,
      { wrapper: createWrapper(mockTeya as unknown as TeyaBlocks) }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-card');
    expect(wrapper.style.border).toBe('1px solid red');
  });
});

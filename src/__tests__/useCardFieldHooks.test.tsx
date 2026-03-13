import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeyaBlocksProvider } from '../context/TeyaBlocksContext';
import { useCardNumberElement } from '../hooks/useCardNumberElement';
import { useCardExpiryElement } from '../hooks/useCardExpiryElement';
import { useCardCvcElement } from '../hooks/useCardCvcElement';
import { createMockBlock, createMockTeya } from './mocks';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import type { UseCardNumberElementResult } from '../hooks/useCardNumberElement';
import type { UseCardExpiryElementResult } from '../hooks/useCardExpiryElement';
import type { UseCardCvcElementResult } from '../hooks/useCardCvcElement';

function getCreateOptions(mockTeya: ReturnType<typeof createMockTeya>) {
  return mockTeya.elements.create.mock.calls[0]?.[1] as Record<string, any>;
}

// --- CardNumber ---

let cardNumberResult: UseCardNumberElementResult;

function CardNumberTestComponent({ config }: { config?: Parameters<typeof useCardNumberElement>[0] }) {
  cardNumberResult = useCardNumberElement(config);
  return <div ref={cardNumberResult.cardNumberElementRef} data-testid="card-number" />;
}

function renderCardNumber(teya: TeyaBlocks | null, config?: Parameters<typeof useCardNumberElement>[0]) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <CardNumberTestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

describe('useCardNumberElement', () => {
  it('returns cardNumberElementRef', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardNumber(mockTeya as unknown as TeyaBlocks);

    expect(cardNumberResult.cardNumberElementRef).toBeDefined();
  });

  it('creates cardNumber element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardNumber(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardNumber', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardNumber(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardNumber',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
      })
    );
  });

  it('does not create element when teya is null', () => {
    renderCardNumber(null);

    expect(cardNumberResult.cardNumberElementRef).toBeDefined();
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

    renderCardNumber(mockTeya as unknown as TeyaBlocks);

    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Failed to create/mount card number element:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('forwards onReady callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    renderCardNumber(mockTeya as unknown as TeyaBlocks, { onReady });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('forwards onChange callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onChange = vi.fn();

    renderCardNumber(mockTeya as unknown as TeyaBlocks, { onChange });

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

    renderCardNumber(mockTeya as unknown as TeyaBlocks, { onFocus, onBlur });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onFocus());
    act(() => opts.onBlur());

    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderCardNumber(mockTeya as unknown as TeyaBlocks);

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

    const { unmount } = renderCardNumber(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(errorSpy).toHaveBeenCalledWith(
      '[Teya Blocks] Error during card number element cleanup:',
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});

// --- CardExpiry ---

let cardExpiryResult: UseCardExpiryElementResult;

function CardExpiryTestComponent({ config }: { config?: Parameters<typeof useCardExpiryElement>[0] }) {
  cardExpiryResult = useCardExpiryElement(config);
  return <div ref={cardExpiryResult.cardExpiryElementRef} data-testid="card-expiry" />;
}

function renderCardExpiry(teya: TeyaBlocks | null, config?: Parameters<typeof useCardExpiryElement>[0]) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <CardExpiryTestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

describe('useCardExpiryElement', () => {
  it('returns cardExpiryElementRef', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardExpiry(mockTeya as unknown as TeyaBlocks);

    expect(cardExpiryResult.cardExpiryElementRef).toBeDefined();
  });

  it('creates cardExpiry element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardExpiry(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardExpiry', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardExpiry(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onChange: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardExpiry',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
      })
    );
  });

  it('does not create element when teya is null', () => {
    renderCardExpiry(null);

    expect(cardExpiryResult.cardExpiryElementRef).toBeDefined();
  });

  it('forwards onReady callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    renderCardExpiry(mockTeya as unknown as TeyaBlocks, { onReady });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderCardExpiry(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(block.unmount).toHaveBeenCalled();
    expect(block.destroy).toHaveBeenCalled();
  });
});

// --- CardCvc ---

let cardCvcResult: UseCardCvcElementResult;

function CardCvcTestComponent({ config }: { config?: Parameters<typeof useCardCvcElement>[0] }) {
  cardCvcResult = useCardCvcElement(config);
  return <div ref={cardCvcResult.cardCvcElementRef} data-testid="card-cvc" />;
}

function renderCardCvc(teya: TeyaBlocks | null, config?: Parameters<typeof useCardCvcElement>[0]) {
  return render(
    <TeyaBlocksProvider teya={teya}>
      <CardCvcTestComponent config={config} />
    </TeyaBlocksProvider>
  );
}

describe('useCardCvcElement', () => {
  it('returns cardCvcElementRef', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardCvc(mockTeya as unknown as TeyaBlocks);

    expect(cardCvcResult.cardCvcElementRef).toBeDefined();
  });

  it('creates cardCvc element via SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardCvc(mockTeya as unknown as TeyaBlocks);

    expect(mockTeya.elements.create).toHaveBeenCalledWith('cardCvc', expect.any(Object));
    expect(block.mount).toHaveBeenCalled();
  });

  it('passes callbacks to SDK', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    renderCardCvc(mockTeya as unknown as TeyaBlocks, {
      onReady: () => {},
      onChange: () => {},
      onFocus: () => {},
      onBlur: () => {},
    });

    expect(mockTeya.elements.create).toHaveBeenCalledWith(
      'cardCvc',
      expect.objectContaining({
        onReady: expect.any(Function),
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
      })
    );
  });

  it('does not create element when teya is null', () => {
    renderCardCvc(null);

    expect(cardCvcResult.cardCvcElementRef).toBeDefined();
  });

  it('forwards onReady callback', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });
    const onReady = vi.fn();

    renderCardCvc(mockTeya as unknown as TeyaBlocks, { onReady });

    const opts = getCreateOptions(mockTeya);
    act(() => opts.onReady());

    expect(onReady).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const { block } = createMockBlock();
    const mockTeya = createMockTeya({ block });

    const { unmount } = renderCardCvc(mockTeya as unknown as TeyaBlocks);

    unmount();
    expect(block.unmount).toHaveBeenCalled();
    expect(block.destroy).toHaveBeenCalled();
  });
});

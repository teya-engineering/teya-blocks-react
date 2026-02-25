import { vi } from 'vitest';

/**
 * Creates a mock Block element with all standard methods.
 * Callbacks are passed via options during element creation.
 */
export function createMockBlock() {
  const block = {
    mount: vi.fn(),
    unmount: vi.fn(),
    destroy: vi.fn(),
    update: vi.fn(),
    submitPayment: vi.fn().mockResolvedValue({ status: 'success', paymentId: 'pay_123' }),
    canMakePayments: vi.fn().mockResolvedValue(true),
    createPaymentMethod: vi.fn().mockResolvedValue({ status: 'SUCCESS', paymentId: 'pay_123' }),
  };

  return { block };
}

/**
 * Creates a mock TeyaBlocks instance.
 */
export function createMockTeya(mockBlock = createMockBlock()) {
  return {
    elements: {
      create: vi.fn(() => mockBlock.block),
      createCheckout: vi.fn(() => mockBlock.block),
    },
  };
}

export type {
  TeyaBlocks,
  TeyaBlocksOptions,
  CardElementOptions,
  CheckoutElementOptions,
  ApplePayElementOptions,
  ApplePayPaymentRequest,
  ApplePayPaymentResult,
  ApplePayChangeEvent,
  ElementChangeEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
  CheckoutPaymentMethod,
  SubmitButtonProps,
} from '@teya/teya-blocks-js';

export type {
  CardElement as CoreCardElement,
  CheckoutElement as CoreCheckoutElement,
  ApplePayElement as CoreApplePayElement,
} from '@teya/teya-blocks-js';

/**
 * Base element options shared by all element types
 */
export interface ElementOptions {
  /** Custom theme variables */
  theme?: Record<string, string>;
  /** Locale for element text */
  locale?: string;
  /** Whether the element is disabled */
  disabled?: boolean;
}

/**
 * Base Block interface for all payment elements.
 * Callbacks are passed via options during element creation.
 */
export interface Block {
  /** Mount the element to a DOM container */
  mount(container: HTMLElement | string): void;
  /** Unmount the element from the DOM */
  unmount(): void;
  /** Destroy the element and clean up resources */
  destroy(): void;
  /** Update element options */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- core SDK accepts arbitrary options per element type
  update(options: any): void;
}

import { useRef, useEffect, useCallback, type RefObject } from 'react';
import { useTeyaBlocksLoader } from './useTeyaBlocks';
import { useStableOptions } from './useStableOptions';
import { useCallbackRefs } from './useCallbackRefs';
import type {
  CardElementOptions,
  ElementChangeEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
  CardElement as CoreCardElement,
} from '../types';

export interface UseCardElementOptions {
  options?: CardElementOptions;
  onReady?: () => void;
  onChange?: (event: ElementChangeEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Callback when payment succeeds (via submitPayment()) */
  onSuccess?: (response: PaymentSubmitResponse) => void;
  /** Callback when payment fails (via submitPayment()) */
  onError?: (error: PaymentSubmitError) => void;
  /** Callback to refresh session token when expiring */
  onTokenRefresh?: () => Promise<string>;
}

export interface UseCardElementResult {
  cardElementRef: RefObject<HTMLDivElement>;
  /** Submit payment and return the result */
  submitPayment: () => Promise<PaymentSubmitResponse>;
}

/**
 * Hook for using the unified card element programmatically.
 * Creates and manages a card input that collects card number, expiry, and CVC in a single field.
 *
 * @example
 * ```tsx
 * function PaymentForm() {
 *   const { cardElementRef, submitPayment } = useCardElement({
 *     options: { hidePostalCode: true },
 *     onSuccess: (response) => console.log('Payment succeeded:', response),
 *     onError: (error) => console.error('Payment failed:', error),
 *   });
 *
 *   return (
 *     <div>
 *       <div ref={cardElementRef} />
 *       <button onClick={submitPayment}>Pay</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCardElement(config?: UseCardElementOptions): UseCardElementResult {
  const { teya } = useTeyaBlocksLoader();
  const cardElementRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const elementRef = useRef<CoreCardElement | null>(null);

  const callbacksRef = useCallbackRefs({
    onReady: config?.onReady,
    onChange: config?.onChange,
    onFocus: config?.onFocus,
    onBlur: config?.onBlur,
    onSuccess: config?.onSuccess,
    onError: config?.onError,
    onTokenRefresh: config?.onTokenRefresh,
  });

  const mergedOptions: CardElementOptions = {
    ...config?.options,
    onReady: () => callbacksRef.current.onReady?.(),
    onChange: (e: ElementChangeEvent) => callbacksRef.current.onChange?.(e),
    onFocus: () => callbacksRef.current.onFocus?.(),
    onBlur: () => callbacksRef.current.onBlur?.(),
    onSuccess: (response: PaymentSubmitResponse) => callbacksRef.current.onSuccess?.(response),
    onError: (error: PaymentSubmitError) => {
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(error);
      } else {
        console.error('[Teya Blocks] Payment error:', error);
      }
    },
    onTokenRefresh: callbacksRef.current.onTokenRefresh
      ? async () => {
          const refreshFn = callbacksRef.current.onTokenRefresh;
          if (!refreshFn) throw new Error('[Teya Blocks] onTokenRefresh callback not provided');
          return refreshFn();
        }
      : undefined,
  };

  const optionsKey = useStableOptions(config?.options);
  const optionsRef = useRef(mergedOptions);

  useEffect(() => {
    optionsRef.current = mergedOptions;
  }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey is the serialized form of mergedOptions

  useEffect(() => {
    if (!teya || !cardElementRef.current) {
      return;
    }

    let element: CoreCardElement;
    try {
      element = teya.elements.create('card', optionsRef.current);
      elementRef.current = element;
      element.mount(cardElementRef.current);
    } catch (error) {
      console.error('[Teya Blocks] Failed to create/mount card element:', error);
      return;
    }

    return () => {
      try {
        element.unmount();
        element.destroy();
      } catch (error) {
        console.error('[Teya Blocks] Error during card element cleanup:', error);
      }
      elementRef.current = null;
    };
  }, [teya, optionsKey]);

  const submitPayment = useCallback(async () => {
    if (!elementRef.current) {
      throw new Error('[Teya Blocks] Card element not initialized');
    }

    return elementRef.current.submitPayment();
  }, []);

  return {
    cardElementRef,
    submitPayment,
  };
}

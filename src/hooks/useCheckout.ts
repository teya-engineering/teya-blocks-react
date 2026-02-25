import { useRef, useEffect, useCallback, useMemo, type RefObject } from 'react';
import { useTeyaBlocksLoader } from './useTeyaBlocks';
import { useStableOptions } from './useStableOptions';
import { useCallbackRefs } from './useCallbackRefs';
import type {
  CheckoutPaymentMethod,
  PaymentSubmitResponse,
  PaymentSubmitError,
  ElementChangeEvent,
  CoreCheckoutElement as CheckoutElement,
  SubmitButtonProps,
} from '../types';

export interface UseCheckoutOptions {
  /**
   * Payment methods to display
   * @default ['card']
   */
  paymentMethods?: CheckoutPaymentMethod[];

  /**
   * Hide submit button - when true, merchant handles button in their DOM
   * @default true
   */
  hideSubmitButton?: boolean;

  /**
   * Submit button configuration
   */
  submitButtonProps?: SubmitButtonProps;

  /**
   * Callback when checkout element is ready
   */
  onReady?: () => void;

  /**
   * Callback when card input changes
   */
  onChange?: (event: ElementChangeEvent) => void;

  /**
   * Callback when payment succeeds
   */
  onSuccess?: (response: PaymentSubmitResponse, paymentMethod: CheckoutPaymentMethod) => void;

  /**
   * Callback when payment fails
   */
  onError?: (error: PaymentSubmitError, paymentMethod: CheckoutPaymentMethod) => void;
}

export interface UseCheckoutResult {
  /**
   * Ref to attach to your container element
   */
  checkoutRef: RefObject<HTMLDivElement>;

  /**
   * Submit card payment (only needed if hideSubmitButton is true)
   */
  submitPayment: () => Promise<PaymentSubmitResponse>;
}

/**
 * Hook for using the unified Checkout element
 *
 * @example
 * ```tsx
 * function CheckoutPage() {
 *   const { checkoutRef, submitPayment } = useCheckout({
 *     paymentMethods: ['APPLE_PAY', 'CARD'],
 *     onSuccess: (result, method) => {
 *       console.log('Payment succeeded via', method, result);
 *     },
 *     onError: (error, method) => {
 *       console.log('Payment failed via', method, error);
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <div ref={checkoutRef} />
 *       <button onClick={submitPayment}>Pay with Card</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCheckout(config?: UseCheckoutOptions): UseCheckoutResult {
  const { teya } = useTeyaBlocksLoader();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<CheckoutElement | null>(null);

  const checkoutOptions = useMemo(
    () => ({
      paymentMethods: config?.paymentMethods,
      hideSubmitButton: config?.hideSubmitButton,
      submitButtonProps: config?.submitButtonProps,
    }),
    [
      config?.paymentMethods,
      config?.hideSubmitButton,
      config?.submitButtonProps,
    ]
  );

  const optionsKey = useStableOptions(checkoutOptions);
  const optionsRef = useRef(checkoutOptions);

  useEffect(() => {
    optionsRef.current = checkoutOptions;
  }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey is the serialized form of checkoutOptions

  const callbacksRef = useCallbackRefs({
    onReady: config?.onReady,
    onChange: config?.onChange,
    onSuccess: config?.onSuccess,
    onError: config?.onError,
  });

  useEffect(() => {
    if (!teya || !checkoutRef.current) {
      return;
    }

    let element: CheckoutElement;
    try {
      const opts = optionsRef.current;
      const createOpts = {
        paymentMethods: opts.paymentMethods,
        hideSubmitButton: opts.hideSubmitButton,
        submitButtonProps: opts.submitButtonProps,
        onReady: () => callbacksRef.current.onReady?.(),
        onChange: (e: ElementChangeEvent) => callbacksRef.current.onChange?.(e),
        onSuccess: (response: PaymentSubmitResponse, method: CheckoutPaymentMethod) =>
          callbacksRef.current.onSuccess?.(response, method),
        onError: (error: PaymentSubmitError, method: CheckoutPaymentMethod) => {
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(error, method);
          } else {
            console.error('[Teya Blocks] Payment error:', error);
          }
        },
      };
      element = teya.elements.create('checkout', createOpts) as CheckoutElement;

      elementRef.current = element;
      element.mount(checkoutRef.current);
    } catch (error) {
      console.error('[Teya Blocks] Failed to create/mount checkout element:', error);
      return;
    }

    return () => {
      try {
        element.unmount();
        element.destroy();
      } catch (error) {
        console.error('[Teya Blocks] Error during checkout element cleanup:', error);
      }
      elementRef.current = null;
    };
  }, [teya, optionsKey]);

  const submitPayment = useCallback(async () => {
    if (!elementRef.current) {
      throw new Error('[Teya Blocks] Checkout element not initialized');
    }

    return elementRef.current.submitPayment();
  }, []);

  return {
    checkoutRef,
    submitPayment,
  };
}

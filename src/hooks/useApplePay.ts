import { useRef, useEffect, useCallback, useState, type RefObject } from 'react';
import { useTeyaBlocksLoader } from './useTeyaBlocks';
import { useStableOptions } from './useStableOptions';
import { useCallbackRefs } from './useCallbackRefs';
import type {
  ApplePayElementOptions,
  ApplePayPaymentRequest,
  ApplePayPaymentResult,
  ApplePayChangeEvent,
  CoreApplePayElement as ApplePayElement,
} from '../types';

export interface UseApplePayOptions {
  /**
   * Element options (button styling)
   */
  options?: ApplePayElementOptions;

  /**
   * Callback when element is ready
   */
  onReady?: () => void;

  /**
   * Callback when button is clicked
   */
  onClick?: () => void;

  /**
   * Callback when payment is completed
   */
  onPaymentCompleted?: (result: ApplePayPaymentResult) => void | Promise<void>;

  /**
   * Callback when user cancels
   */
  onCancel?: () => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when availability changes
   */
  onChange?: (event: ApplePayChangeEvent) => void;
}

export interface UseApplePayResult {
  /**
   * Ref to attach to your container element
   */
  applePayElementRef: RefObject<HTMLDivElement>;

  /**
   * Whether Apple Pay is available on this device
   * null = checking, true = available, false = not available
   */
  isAvailable: boolean | null;

  /**
   * Submit payment with provided payment request
   */
  submit: (paymentRequest: ApplePayPaymentRequest) => Promise<ApplePayPaymentResult>;
}

/**
 * Hook for using Apple Pay element programmatically
 *
 * @example
 * ```tsx
 * function CheckoutPage() {
 *   const { applePayElementRef, isAvailable, submit } = useApplePay({
 *     options: { buttonType: 'buy', buttonStyle: 'black' },
 *     onPaymentCompleted: (result) => {
 *       console.log('Payment completed:', result);
 *     }
 *   });
 *
 *   if (!isAvailable) {
 *     return <CardForm />;
 *   }
 *
 *   return <div ref={applePayElementRef} />;
 * }
 * ```
 */
export function useApplePay(config?: UseApplePayOptions): UseApplePayResult {
  const { teya } = useTeyaBlocksLoader();
  const applePayElementRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<ApplePayElement | null>(null);
  const mountedRef = useRef(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const optionsKey = useStableOptions(config?.options);
  const optionsRef = useRef(config?.options);

  const callbacksRef = useCallbackRefs({
    onReady: config?.onReady,
    onChange: config?.onChange,
    onClick: config?.onClick,
    onPaymentCompleted: config?.onPaymentCompleted,
    onCancel: config?.onCancel,
    onError: config?.onError,
  });

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    if (!teya || !applePayElementRef.current) {
      mountedRef.current = false;
      return;
    }

    let element: ApplePayElement;
    try {
      element = teya.elements.create('applePay', {
        ...config?.options,
        onReady: async () => {
          try {
            const canMake = await element.canMakePayments();
            if (mountedRef.current) {
              setIsAvailable(canMake);
              callbacksRef.current.onReady?.();
            }
          } catch (error) {
            console.error('[Teya Blocks] Failed to check Apple Pay availability:', error);
            if (mountedRef.current) {
              setIsAvailable(false);
            }
          }
        },
        onChange: (e: unknown) => callbacksRef.current.onChange?.(e as ApplePayChangeEvent),
        onClick: () => callbacksRef.current.onClick?.(),
        onPaymentCompleted: async (result: unknown) => {
          const typedResult = result as ApplePayPaymentResult;
          try {
            await callbacksRef.current.onPaymentCompleted?.(typedResult);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            if (callbacksRef.current.onError) {
              callbacksRef.current.onError(err);
            } else {
              console.error('[Teya Blocks] Apple Pay payment error:', err);
            }
          }
        },
        onCancel: () => callbacksRef.current.onCancel?.(),
        onError: (data: unknown) => {
          const errorData = data as { message?: string };
          const err = new Error(errorData.message || 'Apple Pay error');
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(err);
          } else {
            console.error('[Teya Blocks] Apple Pay error:', err);
          }
        },
      }) as ApplePayElement;
      elementRef.current = element;
      element.mount(applePayElementRef.current);
    } catch (error) {
      console.error('[Teya Blocks] Failed to create/mount Apple Pay element:', error);
      mountedRef.current = false;
      return;
    }

    return () => {
      mountedRef.current = false;
      try {
        element.unmount();
        element.destroy();
      } catch (error) {
        console.error('[Teya Blocks] Error during Apple Pay element cleanup:', error);
      }
    };
  }, [teya]);

  useEffect(() => {
    optionsRef.current = config?.options;
  }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey tracks serialized value of config.options

  useEffect(() => {
    if (elementRef.current && optionsRef.current) {
      elementRef.current.update(optionsRef.current as Record<string, unknown>);
    }
  }, [optionsKey]);

  const submit = useCallback(
    async (paymentRequest: ApplePayPaymentRequest) => {
      if (!teya || !elementRef.current) {
        throw new Error('[Teya Blocks] Apple Pay element not initialized');
      }

      return elementRef.current.createPaymentMethod(paymentRequest);
    },
    [teya]
  );

  return {
    applePayElementRef,
    isAvailable,
    submit,
  };
}

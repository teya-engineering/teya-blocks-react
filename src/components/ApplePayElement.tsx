import React, { useEffect, useRef, useState } from 'react';
import { useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import { useStableOptions } from '../hooks/useStableOptions';
import { useCallbackRefs } from '../hooks/useCallbackRefs';
import type {
  ApplePayElementOptions,
  ApplePayPaymentRequest,
  ApplePayPaymentResult,
  ApplePayChangeEvent,
  Block,
  CoreApplePayElement as ApplePayElementClass,
} from '../types';

export interface ApplePayElementProps {
  /**
   * Element options (button styling)
   */
  options?: ApplePayElementOptions;

  /**
   * Payment request configuration
   * Can be provided here or in options
   */
  paymentRequest?: ApplePayPaymentRequest;

  /**
   * Callback when element is ready
   */
  onReady?: (element: Block) => void;

  /**
   * Callback when button is clicked
   */
  onClick?: () => void;

  /**
   * Callback when payment is completed (success or failure)
   */
  onPaymentCompleted?: (result: ApplePayPaymentResult) => void | Promise<void>;

  /**
   * Callback when user cancels Apple Pay
   */
  onCancel?: () => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when Apple Pay availability changes
   */
  onChange?: (event: ApplePayChangeEvent) => void;

  /**
   * Whether to automatically initiate payment when button is clicked
   * If true, paymentRequest must be provided
   * @default false
   */
  autoSubmit?: boolean;

  /**
   * Class name for the container
   */
  className?: string;

  /**
   * Inline styles for the container
   */
  style?: React.CSSProperties;

}

/**
 * Apple Pay Element component for React
 *
 * @example
 * ```tsx
 * <ApplePayElement
 *   options={{ buttonType: 'buy', buttonStyle: 'black' }}
 *   paymentRequest={{
 *     countryCode: 'US',
 *     currencyCode: 'USD',
 *     total: { label: 'My Store', amount: '10.00' }
 *   }}
 *   onPaymentCompleted={(result) => {
 *     if (result.status === 'SUCCESS') {
 *       console.log('Payment successful:', result.paymentId);
 *     }
 *   }}
 *   autoSubmit
 * />
 * ```
 */
export function ApplePayElement({
  options,
  paymentRequest,
  onReady,
  onClick,
  onPaymentCompleted,
  onCancel,
  onError,
  onChange,
  autoSubmit = false,
  className,
  style,
}: ApplePayElementProps) {
  const { teya } = useTeyaBlocksLoader();
  const elementRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<Block | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const optionsKey = useStableOptions(options);
  const optionsRef = useRef(options);
  const isMountedRef = useRef(true);

  const callbacksRef = useCallbackRefs({
    onReady,
    onClick,
    onPaymentCompleted,
    onCancel,
    onError,
    onChange,
  });

  const paymentRequestRef = useRef(paymentRequest);
  useEffect(() => {
    paymentRequestRef.current = paymentRequest;
  }, [paymentRequest]);

  useEffect(() => {
    if (autoSubmit && !paymentRequest && !options?.paymentRequest) {
      console.warn('[ApplePayElement] autoSubmit is enabled but paymentRequest is not provided. Payment will fail when button is clicked.');
    }
  }, [autoSubmit, paymentRequest, options?.paymentRequest]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!teya || !elementRef.current) return;

    const mergedOptions = {
      ...options,
      ...(paymentRequest && { paymentRequest }),
    };

    let applePayElement: Block;
    try {
      applePayElement = teya.elements.create('applePay', {
        ...mergedOptions,
        onReady: async () => {
          try {
            const canMake = await (applePayElement as unknown as ApplePayElementClass).canMakePayments();
            if (isMountedRef.current) {
              setAvailable(canMake);
            }
          } catch (error) {
            console.error('[Teya Blocks] Failed to check Apple Pay availability:', error);
            if (isMountedRef.current) {
              setAvailable(false);
            }
          }

          if (isMountedRef.current) {
            callbacksRef.current.onReady?.(applePayElement);
          }
        },
        onChange: (event: unknown) => {
          callbacksRef.current.onChange?.(event as ApplePayChangeEvent);
        },
        onClick: () => {
          callbacksRef.current.onClick?.();

          if (autoSubmit) {
            handlePayment(applePayElement as unknown as ApplePayElementClass);
          }
        },
        onPaymentCompleted: async (result: unknown) => {
          try {
            await callbacksRef.current.onPaymentCompleted?.(result as ApplePayPaymentResult);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            if (callbacksRef.current.onError) {
              callbacksRef.current.onError(err);
            } else {
              console.error('[Teya Blocks] Apple Pay payment error:', err);
            }
          }
        },
        onCancel: () => {
          callbacksRef.current.onCancel?.();
        },
        onError: (data: unknown) => {
          const errorData = data as { message?: string };
          const err = new Error(errorData.message || 'Apple Pay error');
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(err);
          } else {
            console.error('[Teya Blocks] Apple Pay error:', err);
          }
        },
      }) as Block;

      applePayElement.mount(elementRef.current);

      setElement(applePayElement);
    } catch (error) {
      console.error('[Teya Blocks] Failed to create/mount Apple Pay element:', error);
      return;
    }

    return () => {
      isMountedRef.current = false;
      try {
        applePayElement.unmount();
        applePayElement.destroy();
      } catch (error) {
        console.error('[Teya Blocks] Error during Apple Pay element cleanup:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks accessed via stable refs; options tracked separately
  }, [teya]);

  useEffect(() => {
    optionsRef.current = options;
  }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey is the serialized form of options

  useEffect(() => {
    if (element && optionsRef.current) {
      element.update(optionsRef.current);
    }
  }, [element, optionsKey]);

  const handlePayment = async (applePayElement: ApplePayElementClass) => {
    const request = paymentRequestRef.current || optionsRef.current?.paymentRequest;

    if (!request) {
      const err = new Error('Payment request is required');
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(err);
      } else {
        console.error('[Teya Blocks] Apple Pay error:', err);
      }
      return;
    }

    try {
      const result = await applePayElement.createPaymentMethod(request);
      await callbacksRef.current.onPaymentCompleted?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(err);
      } else {
        console.error('[Teya Blocks] Apple Pay error:', err);
      }
    }
  };

  if (available === false) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      className={className}
      role="button"
      aria-label="Pay with Apple Pay"
      aria-busy={available === null}
      aria-disabled={available === null}
      tabIndex={available ? 0 : -1}
      style={{
        maxHeight: '48px',
        ...style,
      }}
    />
  );
}

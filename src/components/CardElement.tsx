import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import { useStableOptions } from '../hooks/useStableOptions';
import { useCallbackRefs } from '../hooks/useCallbackRefs';
import { LoadingSkeleton } from './LoadingSkeleton';
import type {
  CardElementOptions,
  ElementChangeEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
  Block,
  CoreCardElement,
} from '../types';

/**
 * Ref handle exposed by CardElement for imperative actions
 */
export interface CardElementRef {
  /** Submit the payment */
  submitPayment: () => Promise<PaymentSubmitResponse>;
}

export interface CardElementProps {
  /**
   * Element options
   */
  options?: CardElementOptions;

  /**
   * Callback when element is ready
   */
  onReady?: (element: Block) => void;

  /**
   * Callback when element state changes
   */
  onChange?: (event: ElementChangeEvent) => void;

  /**
   * Callback when element receives focus
   */
  onFocus?: () => void;

  /**
   * Callback when element loses focus
   */
  onBlur?: () => void;

  /**
   * Callback when payment succeeds (via submitPayment())
   */
  onSuccess?: (response: PaymentSubmitResponse) => void;

  /**
   * Callback when payment fails (via submitPayment())
   */
  onError?: (error: PaymentSubmitError) => void;

  /**
   * Callback to refresh session token when expiring
   */
  onTokenRefresh?: () => Promise<string>;

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
 * Card Element component for React
 *
 * @example
 * ```tsx
 * // Basic usage with callbacks
 * <CardElement
 *   options={{ hidePostalCode: false }}
 *   onChange={(e) => console.log(e.complete)}
 * />
 *
 * // With ref for imperative control (submitPayment)
 * const cardRef = useRef<CardElementRef>(null);
 * <CardElement ref={cardRef} onSuccess={handleSuccess} />
 * <button onClick={() => cardRef.current?.submitPayment()}>Pay</button>
 * ```
 */
export const CardElement = forwardRef<CardElementRef, CardElementProps>(function CardElement({
  options,
  onReady,
  onChange,
  onFocus,
  onBlur,
  onSuccess,
  onError,
  onTokenRefresh,
  className,
  style,
}, ref) {
  const { teya } = useTeyaBlocksLoader();
  const elementRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<CoreCardElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const optionsKey = useStableOptions(options ?? {});

  const callbacksRef = useCallbackRefs({
    onReady,
    onChange,
    onFocus,
    onBlur,
    onSuccess,
    onError,
    onTokenRefresh,
  });

  useImperativeHandle(ref, () => ({
    submitPayment: async () => {
      if (!blockRef.current) {
        throw new Error('[Teya Blocks] Card element not initialized. Wait for onReady callback.');
      }
      return blockRef.current.submitPayment();
    },
  }), []);

  useEffect(() => {
    if (!teya || !elementRef.current) return;

    const mergedOptions: CardElementOptions = {
      ...options,
      onReady: () => {
        setIsLoading(false);
        callbacksRef.current.onReady?.(blockRef.current as Block);
      },
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

    let cardElement: CoreCardElement;
    try {
      cardElement = teya.elements.create('card', mergedOptions);
      blockRef.current = cardElement;

      cardElement.mount(elementRef.current);
    } catch (error) {
      console.error('[Teya Blocks] Failed to create/mount card element:', error);
      return;
    }

    return () => {
      try {
        cardElement.destroy();
      } catch (error) {
        console.error('[Teya Blocks] Error during card element cleanup:', error);
      }
      blockRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks accessed via stable callbacksRef, not as direct deps
  }, [teya, optionsKey]);

  return (
    <div
      className={className}
      style={{
        minHeight: '100px',
        position: 'relative',
        ...style,
      }}
    >
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LoadingSkeleton height={40} ariaLabel="Loading cardholder name input" />
          <LoadingSkeleton height={40} ariaLabel="Loading card number input" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <LoadingSkeleton height={40} width="50%" ariaLabel="Loading expiry input" />
            <LoadingSkeleton height={40} width="50%" ariaLabel="Loading CVC input" />
          </div>
        </div>
      )}
      <div
        ref={elementRef}
        role="group"
        aria-label="Card information"
        style={{
          visibility: isLoading ? 'hidden' : 'visible',
          position: isLoading ? 'absolute' : 'static',
          top: 0,
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
});

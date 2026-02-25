import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import { useStableOptions } from '../hooks/useStableOptions';
import { useCallbackRefs } from '../hooks/useCallbackRefs';
import { LoadingSkeleton } from './LoadingSkeleton';
import type {
  CheckoutElementOptions,
  ElementChangeEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
  CheckoutPaymentMethod,
  CoreCheckoutElement,
} from '../types';

export interface CheckoutElementRef {
  /**
   * Submit the payment
   */
  submitPayment: () => Promise<PaymentSubmitResponse>;
}

/** Grouped element container styles for reduced prop count. */
export interface CheckoutElementContainerStyles {
  /** Custom styles for the card element container (e.g., minHeight, width) */
  card?: React.CSSProperties;
  /** Custom styles for the Apple Pay element container */
  applePay?: React.CSSProperties;
}

export interface CheckoutElementProps {
  /**
   * Element options
   */
  options?: CheckoutElementOptions;

  /**
   * Callback when element is ready
   */
  onReady?: () => void;

  /**
   * Callback when element state changes
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

  /**
   * Class name for the container
   */
  className?: string;

  /**
   * Inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Container styles for child elements.
   * Preferred over the deprecated cardStyle/applePayStyle props.
   *
   * @example
   * ```tsx
   * <CheckoutElement
   *   containerStyles={{
   *     card: { minHeight: '100px' },
   *     applePay: { marginTop: '16px' }
   *   }}
   * />
   * ```
   */
  containerStyles?: CheckoutElementContainerStyles;

  /**
   * @deprecated Use containerStyles.card instead
   */
  cardStyle?: React.CSSProperties;

  /**
   * @deprecated Use containerStyles.applePay instead
   */
  applePayStyle?: React.CSSProperties;

  /**
   * Callback to refresh the session token when it's about to expire.
   * Called automatically before payment if the token is expiring soon.
   * Must return a new valid session token string.
   *
   * @example
   * ```tsx
   * <CheckoutElement
   *   onTokenRefresh={async () => {
   *     const response = await fetch('/api/create-checkout-session');
   *     const { sessionToken } = await response.json();
   *     return sessionToken;
   *   }}
   * />
   * ```
   */
  onTokenRefresh?: () => Promise<string>;

  /**
   * Submit button props (style will be converted from React.CSSProperties)
   */
  submitButtonProps?: {
    isCustomButton?: boolean;
    customButton?: string;
    buttonText?: string;
    buttonAmount?: string;
    style?: React.CSSProperties;
    className?: string;
  };
}

// Helper to convert React.CSSProperties to Record<string, string>
function cssPropertiesToRecord(styles?: React.CSSProperties): Record<string, string> | undefined {
  if (!styles) return undefined;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null) {
      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      result[cssKey] = typeof value === 'number' ? `${value}px` : String(value);
    }
  }
  return result;
}

/**
 * Checkout Element component for React
 * Unified payment form with Apple Pay and Card support
 *
 * Note: paymentMethods, supportedCardBrands, and dccEnabled are fetched from the session API.
 *
 * @example Basic usage
 * ```tsx
 * const checkoutRef = useRef<CheckoutElementRef>(null);
 *
 * <CheckoutElement
 *   ref={checkoutRef}
 *   options={{
 *     hideSubmitButton: false,
 *   }}
 *   onSuccess={(response, method) => console.log('Paid via', method)}
 *   onError={(error) => console.error(error)}
 * />
 * <button onClick={() => checkoutRef.current?.submitPayment()}>Pay</button>
 * ```
 */
export const CheckoutElement = forwardRef<CheckoutElementRef, CheckoutElementProps>(
  function CheckoutElement(
    {
      options,
      onReady,
      onChange,
      onSuccess,
      onError,
      className,
      style,
      containerStyles,
      // Support deprecated props for backward compatibility
      cardStyle,
      applePayStyle,
      onTokenRefresh,
      submitButtonProps,
    },
    ref
  ) {
    const { teya } = useTeyaBlocksLoader();
    const elementRef = useRef<HTMLDivElement>(null);
    const checkoutElementRef = useRef<CoreCheckoutElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const optionsKey = useStableOptions({
      ...options,
      containerStyles,
      submitButtonProps,
    });

    const callbacksRef = useCallbackRefs({
      onReady,
      onChange,
      onSuccess,
      onError,
      onTokenRefresh,
    });

    useImperativeHandle(ref, () => ({
      submitPayment: async () => {
        if (!checkoutElementRef.current) {
          throw new Error('[Teya Blocks] Checkout element not initialized. Ensure the component is mounted before calling submitPayment.');
        }
        return checkoutElementRef.current.submitPayment();
      },
    }));

    useEffect(() => {
      if (!teya || !elementRef.current) return;

      const mergedOptions: CheckoutElementOptions = {
        ...options,
        onReady: () => {
          setIsLoading(false);
          callbacksRef.current.onReady?.();
        },
        onChange: (e) => callbacksRef.current.onChange?.(e),
        onSuccess: (response, method) => callbacksRef.current.onSuccess?.(response, method),
        onError: (error, method) => {
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(error, method);
          } else {
            console.error('[Teya Blocks] Payment error:', error);
          }
        },
        cardContainerStyle: cssPropertiesToRecord(containerStyles?.card ?? cardStyle),
        applePayContainerStyle: cssPropertiesToRecord(containerStyles?.applePay ?? applePayStyle),
        onTokenRefresh: (onTokenRefresh || options?.onTokenRefresh)
          ? async () => {
              const refreshFn = callbacksRef.current.onTokenRefresh;
              if (!refreshFn) throw new Error('[Teya Blocks] onTokenRefresh callback not provided');
              return refreshFn();
            }
          : undefined,
        submitButtonProps: submitButtonProps
          ? {
              ...submitButtonProps,
              style: cssPropertiesToRecord(submitButtonProps.style),
            }
          : options?.submitButtonProps,
      };

      let checkoutElement: CoreCheckoutElement;
      try {
        checkoutElement = teya.elements.create('checkout', mergedOptions);
        checkoutElementRef.current = checkoutElement;
        checkoutElement.mount(elementRef.current);
      } catch (error) {
        console.error('[Teya Blocks] Failed to create/mount checkout element:', error);
        return;
      }

      return () => {
        try {
          checkoutElement.destroy();
        } catch (error) {
          console.error('[Teya Blocks] Error during checkout element cleanup:', error);
        }
        checkoutElementRef.current = null;
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: 0,
              animation: 'fadeIn 0.2s ease-in 0.1s forwards',
            }}
          >
            <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
            <LoadingSkeleton height={48} ariaLabel="Loading digital wallet buttons" />
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
          style={{
            visibility: isLoading ? 'hidden' : 'visible',
            position: isLoading ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            minHeight: '100px',
          }}
        />
      </div>
    );
  }
);

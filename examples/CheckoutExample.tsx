import { useMemo, useRef } from 'react';
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import {
  TeyaBlocksProvider,
  CheckoutElement,
  PaymentErrorBoundary,
} from '@teyaproduct/teya-blocks-react';
import type { CheckoutElementRef } from '@teyaproduct/teya-blocks-react';

/**
 * Basic Checkout Example
 *
 * The CheckoutElement provides a unified payment form with card and
 * Apple Pay support. This is the recommended way to accept payments.
 */

// --- Basic usage with built-in submit button ---

export function BasicCheckout({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CheckoutElement
        onSuccess={(response, paymentMethod) => {
          console.log('Payment succeeded via', paymentMethod, response);
        }}
        onError={(error, paymentMethod) => {
          console.error('Payment failed via', paymentMethod, error);
        }}
      />
    </TeyaBlocksProvider>
  );
}

// --- Custom submit button ---

export function CustomSubmitCheckout({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);
  const checkoutRef = useRef<CheckoutElementRef>(null);

  const handleSubmit = async () => {
    try {
      const result = await checkoutRef.current?.submitPayment();
      console.log('Payment result:', result);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CheckoutElement
        ref={checkoutRef}
        options={{ hideSubmitButton: true }}
        onSuccess={(response, method) => {
          console.log('Paid via', method, response);
        }}
        onError={(error, method) => {
          console.error('Failed via', method, error);
        }}
      />
      <button onClick={handleSubmit}>Complete Purchase</button>
    </TeyaBlocksProvider>
  );
}

// --- With token refresh and container styles ---

export function FullCheckout({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);
  const checkoutRef = useRef<CheckoutElementRef>(null);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <PaymentErrorBoundary
        onError={(error) => console.error('Render error:', error)}
        fallback={({ error, resetError }) => (
          <div>
            <p>Payment form failed to load: {error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>
        )}
      >
        <CheckoutElement
          ref={checkoutRef}
          options={{ hideSubmitButton: true }}
          containerStyles={{
            card: { minHeight: '120px' },
            applePay: { marginTop: '16px' },
          }}
          onReady={() => console.log('Checkout ready')}
          onChange={(event) => console.log('Form state:', event)}
          onSuccess={(response, method) => {
            console.log('Paid via', method, response);
          }}
          onError={(error, method) => {
            console.error('Failed via', method, error);
          }}
          onTokenRefresh={async () => {
            const res = await fetch('/api/refresh-session');
            const { sessionToken } = await res.json();
            return sessionToken;
          }}
        />
        <button onClick={() => checkoutRef.current?.submitPayment()}>Pay Now</button>
      </PaymentErrorBoundary>
    </TeyaBlocksProvider>
  );
}

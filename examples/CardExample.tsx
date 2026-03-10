import React, { useMemo, useRef, useState } from 'react';
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import {
  TeyaBlocksProvider,
  CardElement,
  PaymentErrorBoundary,
} from '@teyaproduct/teya-blocks-react';
import type { CardElementRef } from '@teyaproduct/teya-blocks-react';

/**
 * Card Element Examples
 *
 * The CardElement provides a single unified card input collecting
 * card number, expiry, and CVC in one component.
 */

// --- Basic card payment ---

export function BasicCard({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);
  const cardRef = useRef<CardElementRef>(null);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CardElement
        ref={cardRef}
        onSuccess={(response) => console.log('Payment succeeded:', response)}
        onError={(error) => console.error('Payment failed:', error)}
      />
      <button onClick={() => cardRef.current?.submitPayment()}>Pay</button>
    </TeyaBlocksProvider>
  );
}

// --- Card with form validation and loading state ---

export function CardWithValidation({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);
  const cardRef = useRef<CardElementRef>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await cardRef.current?.submitPayment();
      console.log('Payment result:', result);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <form onSubmit={handleSubmit}>
        <CardElement
          ref={cardRef}
          options={{ showAcceptedBrands: true }}
          onReady={() => console.log('Card element ready')}
          onChange={(event) => setIsComplete(event.complete)}
          onFocus={() => console.log('Card focused')}
          onBlur={() => console.log('Card blurred')}
          onSuccess={(response) => {
            console.log('Payment succeeded:', response);
          }}
          onError={(error) => {
            console.error('Payment failed:', error);
          }}
        />
        <button type="submit" disabled={!isComplete || isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Pay'}
        </button>
      </form>
    </TeyaBlocksProvider>
  );
}

// --- Card with token refresh and error boundary ---

export function CardWithTokenRefresh({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);
  const cardRef = useRef<CardElementRef>(null);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <PaymentErrorBoundary
        fallback={({ error, resetError }) => (
          <div>
            <p>Card form error: {error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>
        )}
      >
        <CardElement
          ref={cardRef}
          onSuccess={(response) => console.log('Paid:', response)}
          onError={(error) => console.error('Failed:', error)}
          onTokenRefresh={async () => {
            const res = await fetch('/api/refresh-session');
            const { sessionToken } = await res.json();
            return sessionToken;
          }}
        />
        <button onClick={() => cardRef.current?.submitPayment()}>Pay</button>
      </PaymentErrorBoundary>
    </TeyaBlocksProvider>
  );
}

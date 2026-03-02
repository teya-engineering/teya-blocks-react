import React, { useMemo } from 'react';
import { loadTeyaBlocks } from '@teya/teya-blocks-js';
import {
  TeyaBlocksProvider,
  ApplePayElement,
  useApplePay,
} from '@teya-blocks/react';

/**
 * Apple Pay Examples
 *
 * The ApplePayElement renders an Apple Pay button that automatically
 * hides when Apple Pay is unavailable on the device/browser.
 */

// --- Basic Apple Pay with auto-submit ---

export function BasicApplePay({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(
    () => loadTeyaBlocks(sessionToken),
    [sessionToken]
  );

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <ApplePayElement
        options={{ buttonType: 'buy', buttonColor: 'black' }}
        paymentRequest={{
          countryCode: 'US',
          currencyCode: 'USD',
          total: { label: 'My Store', amount: '10.00' },
        }}
        autoSubmit
        onPaymentCompleted={(result) => {
          if (result.status === 'SUCCESS') {
            console.log('Payment ID:', result.paymentId);
          }
        }}
        onError={(error) => console.error('Apple Pay error:', error)}
      />
    </TeyaBlocksProvider>
  );
}

// --- Apple Pay with all callbacks ---

export function DetailedApplePay({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(
    () => loadTeyaBlocks(sessionToken),
    [sessionToken]
  );

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <ApplePayElement
        options={{ buttonType: 'pay', buttonColor: 'white-outline' }}
        paymentRequest={{
          countryCode: 'GB',
          currencyCode: 'GBP',
          total: { label: 'Example Shop', amount: '25.00' },
        }}
        autoSubmit
        onReady={() => console.log('Apple Pay button ready')}
        onClick={() => console.log('Apple Pay button clicked')}
        onPaymentCompleted={(result) => {
          console.log('Payment completed:', result);
        }}
        onCancel={() => console.log('User cancelled Apple Pay')}
        onError={(error) => console.error('Apple Pay error:', error)}
        onChange={(event) => console.log('Availability changed:', event)}
        style={{ maxWidth: '300px' }}
      />
    </TeyaBlocksProvider>
  );
}

// --- Apple Pay using the hook API ---

function ApplePayHookForm() {
  const { applePayElementRef, isAvailable, submit } = useApplePay({
    options: { buttonType: 'buy', buttonColor: 'black' },
    onPaymentCompleted: (result) => {
      console.log('Payment result:', result);
    },
    onError: (error) => {
      console.error('Apple Pay error:', error);
    },
  });

  if (isAvailable === null) {
    return <p>Checking Apple Pay availability...</p>;
  }

  if (isAvailable === false) {
    return null;
  }

  return (
    <div>
      <div ref={applePayElementRef} />
      <button
        onClick={() =>
          submit({
            countryCode: 'US',
            currencyCode: 'USD',
            total: { label: 'My Store', amount: '15.00' },
          })
        }
      >
        Pay with Apple Pay
      </button>
    </div>
  );
}

export function HookApplePay({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(
    () => loadTeyaBlocks(sessionToken),
    [sessionToken]
  );

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <ApplePayHookForm />
    </TeyaBlocksProvider>
  );
}

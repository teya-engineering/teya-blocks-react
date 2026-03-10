# Teya Blocks React

React components and hooks for [Teya Blocks](https://teya.com) payment integration.

[![npm version](https://img.shields.io/npm/v/%40teyaproduct%2Fteya-blocks-react.svg?style=flat-square)](https://www.npmjs.com/package/@teyaproduct/teya-blocks-react)

## Requirements

- `@teyaproduct/teya-blocks-js` 1.0+
- React 18.0+ or 19.0+

## Getting Started

### Installation

```sh
npm install @teyaproduct/teya-blocks-js @teyaproduct/teya-blocks-react
```

### Minimal Example

```jsx
import { useMemo } from 'react';
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import { TeyaBlocksProvider, CheckoutElement } from '@teyaproduct/teya-blocks-react';

const App = () => {
  const teyaPromise = useMemo(() => initTeyaBlocks('your_session_token'), []);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CheckoutForm />
    </TeyaBlocksProvider>
  );
};

const CheckoutForm = () => {
  return (
    <CheckoutElement
      onSuccess={(response, paymentMethod) => {
        console.log('Payment succeeded via', paymentMethod, response);
      }}
      onError={(error, paymentMethod) => {
        console.error('Payment failed via', paymentMethod, error);
      }}
    />
  );
};
```

### Using hooks for custom layouts

For full control over your payment UI, use the hooks API.

```jsx
import { useMemo } from 'react';
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import { TeyaBlocksProvider, useCheckout } from '@teyaproduct/teya-blocks-react';

const App = () => {
  const teyaPromise = useMemo(() => initTeyaBlocks('your_session_token'), []);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CheckoutForm />
    </TeyaBlocksProvider>
  );
};

const CheckoutForm = () => {
  const { checkoutRef, submitPayment } = useCheckout({
    onSuccess: (response, method) => {
      console.log('Paid via', method, response);
    },
    onError: (error, method) => {
      console.error('Failed via', method, error);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitPayment();
      }}
    >
      <div ref={checkoutRef} />
      <button type="submit">Pay</button>
    </form>
  );
};
```

## Documentation

- [Teya Blocks documentation](https://teya.com/docs)
- [API reference](#api-reference)
- [Examples](#examples)
- [More examples](examples/) - Checkout, Card, Card Fields, Apple Pay

## API Reference

### `TeyaBlocksProvider`

All components and hooks must be wrapped in a `TeyaBlocksProvider`. It accepts a `TeyaBlocks` instance or the `Promise` returned by `initTeyaBlocks()`.

```jsx
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import { TeyaBlocksProvider } from '@teyaproduct/teya-blocks-react';

const teyaPromise = initTeyaBlocks('your_session_token');

<TeyaBlocksProvider teya={teyaPromise}>
  <App />
</TeyaBlocksProvider>;
```

| Prop       | Type                                                | Description                                     |
| ---------- | --------------------------------------------------- | ----------------------------------------------- |
| `teya`     | `TeyaBlocks \| Promise<TeyaBlocks \| null> \| null` | SDK instance or promise from `initTeyaBlocks()` |
| `children` | `ReactNode`                                         | Child components                                |

### Components

#### `CheckoutElement`

Unified payment form with card and Apple Pay support. This is the recommended way to accept payments.

```jsx
import { useRef } from 'react';
import { CheckoutElement } from '@teyaproduct/teya-blocks-react';

const PaymentForm = () => {
  const checkoutRef = useRef(null);

  return (
    <>
      <CheckoutElement
        ref={checkoutRef}
        options={{ hideSubmitButton: true }}
        onSuccess={(response, method) => console.log('Paid via', method)}
        onError={(error, method) => console.error(error)}
        onTokenRefresh={async () => {
          const res = await fetch('/api/refresh-session');
          const { sessionToken } = await res.json();
          return sessionToken;
        }}
        containerStyles={{
          card: { minHeight: '100px' },
          applePay: { marginTop: '16px' },
        }}
      />
      <button onClick={() => checkoutRef.current?.submitPayment()}>Pay Now</button>
    </>
  );
};
```

| Prop                | Type                                               | Description                                 |
| ------------------- | -------------------------------------------------- | ------------------------------------------- |
| `options`           | `CheckoutElementOptions`                           | SDK checkout configuration                  |
| `onReady`           | `() => void`                                       | Called when element is ready                |
| `onChange`          | `(event: ElementChangeEvent) => void`              | Called on form state changes                |
| `onSuccess`         | `(response, paymentMethod) => void`                | Called on payment success                   |
| `onError`           | `(error, paymentMethod) => void`                   | Called on payment failure                   |
| `onTokenRefresh`    | `() => Promise<string>`                            | Called to refresh an expiring session token |
| `submitButtonProps` | `object`                                           | Submit button customization                 |
| `containerStyles`   | `{card?: CSSProperties; applePay?: CSSProperties}` | Container styles for child elements         |
| `className`         | `string`                                           | Container CSS class                         |
| `style`             | `CSSProperties`                                    | Container inline styles                     |

**Ref methods:**

| Method            | Returns                          | Description                         |
| ----------------- | -------------------------------- | ----------------------------------- |
| `submitPayment()` | `Promise<PaymentSubmitResponse>` | Programmatically submit the payment |

---

#### `CardElement`

Single card input collecting card number, expiry, and CVC.

```jsx
import { useRef } from 'react';
import { CardElement } from '@teyaproduct/teya-blocks-react';

const CardForm = () => {
  const cardRef = useRef(null);

  return (
    <>
      <CardElement
        ref={cardRef}
        options={{ hidePostalCode: true }}
        onChange={(e) => console.log('Complete:', e.complete)}
        onSuccess={(response) => console.log('Paid:', response)}
        onError={(error) => console.error(error)}
      />
      <button onClick={() => cardRef.current?.submitPayment()}>Pay</button>
    </>
  );
};
```

| Prop             | Type                                  | Description                                 |
| ---------------- | ------------------------------------- | ------------------------------------------- |
| `options`        | `CardElementOptions`                  | Card element configuration                  |
| `onReady`        | `(element) => void`                   | Called when element is ready                |
| `onChange`       | `(event: ElementChangeEvent) => void` | Called on field state changes               |
| `onFocus`        | `() => void`                          | Called when element receives focus          |
| `onBlur`         | `() => void`                          | Called when element loses focus             |
| `onSuccess`      | `(response) => void`                  | Called on payment success                   |
| `onError`        | `(error) => void`                     | Called on payment failure                   |
| `onTokenRefresh` | `() => Promise<string>`               | Called to refresh an expiring session token |
| `className`      | `string`                              | Container CSS class                         |
| `style`          | `CSSProperties`                       | Container inline styles                     |

**Ref methods:**

| Method            | Returns                          | Description                         |
| ----------------- | -------------------------------- | ----------------------------------- |
| `submitPayment()` | `Promise<PaymentSubmitResponse>` | Programmatically submit the payment |

---

#### `ApplePayElement`

Renders an Apple Pay button. Automatically hides when Apple Pay is unavailable.

```jsx
import { ApplePayElement } from '@teyaproduct/teya-blocks-react';

const ApplePay = () => (
  <ApplePayElement
    options={{ buttonType: 'buy', buttonStyle: 'black' }}
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
    onError={(error) => console.error(error)}
  />
);
```

| Prop                 | Type                     | Description                                       |
| -------------------- | ------------------------ | ------------------------------------------------- |
| `options`            | `ApplePayElementOptions` | Button styling options                            |
| `paymentRequest`     | `ApplePayPaymentRequest` | Payment request configuration                     |
| `autoSubmit`         | `boolean`                | Auto-initiate payment on click (default: `false`) |
| `onReady`            | `(element) => void`      | Called when element is ready                      |
| `onClick`            | `() => void`             | Called when button is clicked                     |
| `onPaymentCompleted` | `(result) => void`       | Called when payment completes                     |
| `onCancel`           | `() => void`             | Called when user cancels                          |
| `onError`            | `(error: Error) => void` | Called when an error occurs                       |
| `onChange`           | `(event) => void`        | Called when availability changes                  |
| `className`          | `string`                 | Container CSS class                               |
| `style`              | `CSSProperties`          | Container inline styles                           |

---

#### Individual Card Fields

Separate components for custom card form layouts.

```jsx
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@teyaproduct/teya-blocks-react';

const CustomCardForm = () => (
  <div>
    <label>Card Number</label>
    <CardNumberElement onChange={(e) => console.log(e)} />

    <div style={{ display: 'flex', gap: '12px' }}>
      <div>
        <label>Expiry</label>
        <CardExpiryElement />
      </div>
      <div>
        <label>CVC</label>
        <CardCvcElement />
      </div>
    </div>
  </div>
);
```

All three share the same props:

| Prop        | Type                                  | Description                        |
| ----------- | ------------------------------------- | ---------------------------------- |
| `options`   | `CardElementOptions`                  | Element configuration              |
| `onReady`   | `() => void`                          | Called when element is ready       |
| `onChange`  | `(event: ElementChangeEvent) => void` | Called on field state changes      |
| `onFocus`   | `() => void`                          | Called when element receives focus |
| `onBlur`    | `() => void`                          | Called when element loses focus    |
| `className` | `string`                              | Container CSS class                |
| `style`     | `CSSProperties`                       | Container inline styles            |

---

#### `PaymentErrorBoundary`

Error boundary that catches rendering errors in payment components.

```jsx
import { PaymentErrorBoundary, CardElement } from '@teyaproduct/teya-blocks-react';

const SafePayment = () => (
  <PaymentErrorBoundary
    onError={(error) => console.error('Payment error:', error)}
    fallback={({ error, resetError }) => (
      <div>
        <p>Payment form failed to load: {error.message}</p>
        <button onClick={resetError}>Retry</button>
      </div>
    )}
  >
    <CardElement />
  </PaymentErrorBoundary>
);
```

| Prop       | Type                                              | Description                      |
| ---------- | ------------------------------------------------- | -------------------------------- |
| `children` | `ReactNode`                                       | Child components to protect      |
| `fallback` | `ReactNode \| ({error, resetError}) => ReactNode` | Custom fallback UI               |
| `onError`  | `(error, errorInfo) => void`                      | Called when an error is caught   |
| `onReset`  | `() => void`                                      | Called when error state is reset |

---

#### `LoadingSkeleton`

Placeholder component shown while payment elements load. Built-in to `CardElement` and `CheckoutElement`, but also available for custom usage.

```jsx
import { LoadingSkeleton } from '@teyaproduct/teya-blocks-react';

<LoadingSkeleton height={40} width="100%" ariaLabel="Loading card input" />;
```

| Prop        | Type               | Default        | Description            |
| ----------- | ------------------ | -------------- | ---------------------- |
| `height`    | `number \| string` | `40`           | Skeleton height        |
| `width`     | `number \| string` | `'100%'`       | Skeleton width         |
| `animate`   | `boolean`          | `true`         | Enable pulse animation |
| `ariaLabel` | `string`           | `'Loading...'` | Screen reader label    |
| `className` | `string`           | -              | CSS class              |
| `style`     | `CSSProperties`    | -              | Inline styles          |

### Hooks

Hooks provide a lower-level API for building custom payment UIs. Each hook returns a ref to attach to a container `<div>`.

#### `useTeyaBlocks()`

Returns the `TeyaBlocks` SDK instance. Throws if SDK is not yet loaded.

```jsx
const teya = useTeyaBlocks();
```

#### `useTeyaBlocksLoader()`

Returns the SDK instance along with loading and error state.

```jsx
const { teya, loading, error, isReady } = useTeyaBlocksLoader();

if (loading) return <Spinner />;
if (error) return <p>Failed to load: {error.message}</p>;
```

| Return Value | Type                 | Description                 |
| ------------ | -------------------- | --------------------------- |
| `teya`       | `TeyaBlocks \| null` | SDK instance                |
| `loading`    | `boolean`            | Whether SDK is loading      |
| `error`      | `Error \| null`      | Error if SDK failed to load |
| `isReady`    | `boolean`            | `true` when SDK is loaded   |

---

#### `useCheckout(options?)`

Hook for programmatic control of the checkout element.

```jsx
const { checkoutRef, submitPayment } = useCheckout({
  onSuccess: (response, method) => console.log('Paid via', method),
  onError: (error, method) => console.error('Failed via', method),
});

return (
  <div>
    <div ref={checkoutRef} />
    <button onClick={submitPayment}>Pay</button>
  </div>
);
```

---

#### `useCardElement(options?)`

Hook for programmatic control of the card element.

```jsx
const { cardElementRef, submitPayment } = useCardElement({
  options: { hidePostalCode: true },
  onSuccess: (response) => console.log('Paid:', response),
  onError: (error) => console.error('Failed:', error),
});

return (
  <div>
    <div ref={cardElementRef} />
    <button onClick={submitPayment}>Pay</button>
  </div>
);
```

---

#### `useApplePay(options?)`

Hook for programmatic Apple Pay integration.

```jsx
const { applePayElementRef, isAvailable, submit } = useApplePay({
  options: { buttonType: 'buy', buttonStyle: 'black' },
  onPaymentCompleted: (result) => console.log('Payment:', result),
  onError: (error) => console.error(error),
});

if (isAvailable === false) return null;

return <div ref={applePayElementRef} />;
```

| Return Value         | Type                                          | Description                                                  |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `applePayElementRef` | `RefObject<HTMLDivElement>`                   | Attach to container div                                      |
| `isAvailable`        | `boolean \| null`                             | `null` = checking, `true` = available, `false` = unavailable |
| `submit`             | `(request) => Promise<ApplePayPaymentResult>` | Submit with payment request                                  |

---

#### Individual Card Field Hooks

Hooks for individual card fields when building custom layouts.

```jsx
import {
  useCardNumberElement,
  useCardExpiryElement,
  useCardCvcElement,
} from '@teyaproduct/teya-blocks-react';

const { cardNumberElementRef } = useCardNumberElement({
  onChange: (e) => console.log('Number changed:', e),
});
const { cardExpiryElementRef } = useCardExpiryElement();
const { cardCvcElementRef } = useCardCvcElement();

return (
  <div>
    <div ref={cardNumberElementRef} />
    <div ref={cardExpiryElementRef} />
    <div ref={cardCvcElementRef} />
  </div>
);
```

## Examples

### Token refresh

Handle session token expiration with the `onTokenRefresh` callback:

```jsx
<CheckoutElement
  onTokenRefresh={async () => {
    const response = await fetch('/api/create-checkout-session');
    const { sessionToken } = await response.json();
    return sessionToken;
  }}
  onSuccess={(response) => console.log('Paid:', response)}
/>
```

### Custom submit button

Use `hideSubmitButton` with a ref to trigger payment from your own button:

```jsx
const checkoutRef = useRef(null);

<CheckoutElement
  ref={checkoutRef}
  options={{hideSubmitButton: true}}
  onSuccess={(response) => console.log('Paid:', response)}
/>
<button onClick={() => checkoutRef.current?.submitPayment()}>
  Complete Purchase
</button>
```

### Error boundary with custom fallback

```jsx
<PaymentErrorBoundary
  fallback={({ error, resetError }) => (
    <div className="error-container">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Report to your error tracking service
    myErrorTracker.capture(error, errorInfo);
  }}
>
  <CheckoutElement onSuccess={handleSuccess} />
</PaymentErrorBoundary>
```

## TypeScript

This package includes TypeScript declarations. All types are exported:

```tsx
import type {
  // SDK types
  TeyaBlocks,
  TeyaBlocksOptions,
  CardElementOptions,
  CheckoutElementOptions,
  ApplePayElementOptions,
  ApplePayPaymentRequest,
  ApplePayPaymentResult,
  ElementChangeEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
  CheckoutPaymentMethod,
  SubmitButtonProps,

  // Component props
  CardElementProps,
  CardElementRef,
  CheckoutElementProps,
  CheckoutElementRef,
  ApplePayElementProps,
  LoadingSkeletonProps,
  PaymentErrorBoundaryProps,
  PaymentErrorFallbackProps,

  // Hook types
  UseCardElementOptions,
  UseCardElementResult,
  UseCheckoutOptions,
  UseCheckoutResult,
  UseApplePayOptions,
  UseApplePayResult,
} from '@teyaproduct/teya-blocks-react';
```

## Development

```sh
npm install        # Install dependencies
npm run build      # Build (CJS + ESM + type declarations)
npm run dev        # Watch mode
npm run type-check # TypeScript type checking
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run clean      # Remove dist/
```

## Contributing

Contributions welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## License

[Apache 2.0](LICENSE)

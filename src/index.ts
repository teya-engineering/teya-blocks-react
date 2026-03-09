export { initTeyaBlocks } from './types';

export { TeyaBlocksProvider } from './context/TeyaBlocksContext';
export type { TeyaBlocksProviderProps } from './context/TeyaBlocksContext';

export { useTeyaBlocks, useTeyaBlocksLoader } from './hooks/useTeyaBlocks';
export { useCardElement } from './hooks/useCardElement';
export { useCardNumberElement } from './hooks/useCardNumberElement';
export { useCardExpiryElement } from './hooks/useCardExpiryElement';
export { useCardCvcElement } from './hooks/useCardCvcElement';
export { useApplePay } from './hooks/useApplePay';
export { useCheckout } from './hooks/useCheckout';

export type { UseCardElementOptions, UseCardElementResult } from './hooks/useCardElement';
export type {
  UseCardNumberElementOptions,
  UseCardNumberElementResult,
} from './hooks/useCardNumberElement';
export type {
  UseCardExpiryElementOptions,
  UseCardExpiryElementResult,
} from './hooks/useCardExpiryElement';
export type { UseCardCvcElementOptions, UseCardCvcElementResult } from './hooks/useCardCvcElement';
export type { UseApplePayOptions, UseApplePayResult } from './hooks/useApplePay';
export type { UseCheckoutOptions, UseCheckoutResult } from './hooks/useCheckout';

export { CardElement } from './components/CardElement';
export { CardNumberElement } from './components/CardNumberElement';
export { CardExpiryElement } from './components/CardExpiryElement';
export { CardCvcElement } from './components/CardCvcElement';
export { ApplePayElement } from './components/ApplePayElement';
export { CheckoutElement } from './components/CheckoutElement';
export { PaymentErrorBoundary } from './components/PaymentErrorBoundary';
export { LoadingSkeleton } from './components/LoadingSkeleton';

export type { CardElementProps, CardElementRef } from './components/CardElement';
export type { CardNumberElementProps } from './components/CardNumberElement';
export type { CardExpiryElementProps } from './components/CardExpiryElement';
export type { CardCvcElementProps } from './components/CardCvcElement';
export type { ApplePayElementProps } from './components/ApplePayElement';
export type { CheckoutElementProps, CheckoutElementRef } from './components/CheckoutElement';
export type {
  PaymentErrorBoundaryProps,
  PaymentErrorFallbackProps,
} from './components/PaymentErrorBoundary';
export type { LoadingSkeletonProps } from './components/LoadingSkeleton';

// Core SDK types (same as @teyaproduct/teya-blocks-js)
export type {
  TeyaBlocks,
  TeyaBlocksOptions,
  ElementsFactory,
  ElementType,
  SubmitPaymentOptions,
  Appearance,
  AppearanceRules,
  ThemeVariables,
  FontFamily,
  Locale,
  ThemePresetName,
  CSSProperties,
  BaseElement,
  CardElementOptions,
  CardNumberElementOptions,
  CardExpiryElementOptions,
  CardCvcElementOptions,
  CheckoutElementOptions,
  CheckoutPaymentMethod,
  SubmitButtonProps,
  ApplePayElementOptions,
  ApplePayPaymentRequest,
  ApplePayPaymentResult,
  ApplePayChangeEvent,
  ApplePayContactField,
  ApplePayMerchantCapability,
  ApplePayShippingType,
  ApplePayShippingContactEditingMode,
  ApplePayPaymentContact,
  ApplePayLineItem,
  ApplePayRecurringPaymentRequest,
  ElementReadyEvent,
  ElementChangeEvent,
  ElementErrorEvent,
  PaymentCompletedEvent,
  PaymentSubmitResponse,
  PaymentSubmitError,
} from './types';

export type { Block, ElementOptions } from './types';

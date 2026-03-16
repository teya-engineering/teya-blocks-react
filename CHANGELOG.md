# @teyaproduct/teya-blocks-react

## 0.1.0

### Minor Changes

- Refactored callback handling for `ApplePayElement` and `CheckoutElement` components to use `onSuccess` instead of `onPaymentCompleted`, aligning the API across all payment components
- Updated `TeyaBlocksContext` to improve provider type safety
- Added Apple Pay button component styling updates
- Renamed package to `@teyaproduct/teya-blocks-react`
- Added CI workflow and release automation via GitHub Actions
- Added usage examples for Card, CardFields, Checkout, and Apple Pay integrations
- Bumped `@teyaproduct/teya-blocks-js` dependency to `^0.2.0`

## 0.0.2

### Patch Changes

- Upgraded `@teyaproduct/teya-blocks-js` dependency from `^0.0.2` to `^0.1.0` to pick up latest SDK improvements
- Added npm script to remove `package-lock.json` for cleaner dependency management

## 0.0.1

### Patch Changes

- Initial release of `@teyaproduct/teya-blocks-react`
- Migrated to use `@teyaproduct/teya-blocks-js` as the underlying payment SDK
- Added React components: `CardElement`, `CheckoutElement`, `ApplePayElement`, `CardNumberElement`, `CardExpiryElement`, `CardCvcElement`
- Added React hooks: `useCardElement`, `useCheckout`, `useApplePay`, `useCardNumberElement`, `useCardExpiryElement`, `useCardCvcElement`, `useTeyaBlocks`
- Added `TeyaBlocksProvider` context for SDK initialization
- Added `PaymentErrorBoundary` for graceful error handling
- Set up build tooling, CI pipeline, and release workflow
- Added contributing guide and README documentation

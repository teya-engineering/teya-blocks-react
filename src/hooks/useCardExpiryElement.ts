import { createCardFieldHook, type CardFieldHookOptions, type CardFieldHookResult } from './createCardFieldHook';
import type { ElementOptions } from '../types';

export interface UseCardExpiryElementOptions extends CardFieldHookOptions {
  options?: ElementOptions;
}

export interface UseCardExpiryElementResult {
  cardExpiryElementRef: CardFieldHookResult['elementRef'];
}

const useCardExpiryField = createCardFieldHook({
  elementType: 'cardExpiry',
  displayName: 'card expiry element',
});

/**
 * Hook for using the card expiry element programmatically.
 * Attach the returned ref to a container element to render the input.
 *
 * @example
 * ```tsx
 * function CardExpiryField() {
 *   const { cardExpiryElementRef } = useCardExpiryElement({
 *     onChange: (e) => console.log('Expiry changed:', e),
 *   });
 *   return <div ref={cardExpiryElementRef} />;
 * }
 * ```
 */
export function useCardExpiryElement(config?: UseCardExpiryElementOptions): UseCardExpiryElementResult {
  const { elementRef } = useCardExpiryField(config);
  return { cardExpiryElementRef: elementRef };
}

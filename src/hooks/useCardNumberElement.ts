import { createCardFieldHook, type CardFieldHookOptions, type CardFieldHookResult } from './createCardFieldHook';
import type { ElementOptions } from '../types';

export interface UseCardNumberElementOptions extends CardFieldHookOptions {
  options?: ElementOptions;
}

export interface UseCardNumberElementResult {
  cardNumberElementRef: CardFieldHookResult['elementRef'];
}

const useCardNumberField = createCardFieldHook({
  elementType: 'cardNumber',
  displayName: 'card number element',
});

/**
 * Hook for using the card number element programmatically.
 * Attach the returned ref to a container element to render the input.
 *
 * @example
 * ```tsx
 * function CardNumberField() {
 *   const { cardNumberElementRef } = useCardNumberElement({
 *     onChange: (e) => console.log('Card number changed:', e),
 *   });
 *   return <div ref={cardNumberElementRef} />;
 * }
 * ```
 */
export function useCardNumberElement(config?: UseCardNumberElementOptions): UseCardNumberElementResult {
  const { elementRef } = useCardNumberField(config);
  return { cardNumberElementRef: elementRef };
}

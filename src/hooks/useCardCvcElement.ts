import { createCardFieldHook, type CardFieldHookOptions, type CardFieldHookResult } from './createCardFieldHook';
import type { ElementOptions } from '../types';

export interface UseCardCvcElementOptions extends CardFieldHookOptions {
  options?: ElementOptions;
}

export interface UseCardCvcElementResult {
  cardCvcElementRef: CardFieldHookResult['elementRef'];
}

const useCardCvcField = createCardFieldHook({
  elementType: 'cardCvc',
  displayName: 'card CVC element',
});

/**
 * Hook for using the card CVC element programmatically.
 * Attach the returned ref to a container element to render the input.
 *
 * @example
 * ```tsx
 * function CardCvcField() {
 *   const { cardCvcElementRef } = useCardCvcElement({
 *     onChange: (e) => console.log('CVC changed:', e),
 *   });
 *   return <div ref={cardCvcElementRef} />;
 * }
 * ```
 */
export function useCardCvcElement(config?: UseCardCvcElementOptions): UseCardCvcElementResult {
  const { elementRef } = useCardCvcField(config);
  return { cardCvcElementRef: elementRef };
}

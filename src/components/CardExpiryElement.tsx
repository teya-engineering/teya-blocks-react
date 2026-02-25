import { createCardFieldComponent, type CardFieldProps } from './createCardFieldComponent';
import type { ElementOptions } from '../types';

export interface CardExpiryElementProps extends CardFieldProps {
  options?: ElementOptions;
}

/**
 * Card Expiry Element component for React
 */
export const CardExpiryElement = createCardFieldComponent<ElementOptions>({
  elementType: 'cardExpiry',
  ariaLabel: 'Card expiry date',
  displayName: 'CardExpiryElement',
});

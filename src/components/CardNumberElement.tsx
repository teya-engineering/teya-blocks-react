import { createCardFieldComponent, type CardFieldProps } from './createCardFieldComponent';
import type { CardElementOptions } from '../types';

export interface CardNumberElementProps extends CardFieldProps {
  options?: CardElementOptions;
}

/**
 * Card Number Element component for React
 */
export const CardNumberElement = createCardFieldComponent<CardElementOptions>({
  elementType: 'cardNumber',
  ariaLabel: 'Card number',
  displayName: 'CardNumberElement',
});

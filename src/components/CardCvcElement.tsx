import { createCardFieldComponent, type CardFieldProps } from './createCardFieldComponent';
import type { ElementOptions } from '../types';

export interface CardCvcElementProps extends CardFieldProps {
  options?: ElementOptions;
}

/**
 * Card CVC Element component for React
 */
export const CardCvcElement = createCardFieldComponent<ElementOptions>({
  elementType: 'cardCvc',
  ariaLabel: 'Card security code',
  displayName: 'CardCvcElement',
});

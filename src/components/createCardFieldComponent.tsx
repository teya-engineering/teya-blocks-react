import React, { useEffect, useRef, useState } from 'react';
import { useTeyaBlocksLoader } from '../hooks/useTeyaBlocks';
import { useStableOptions } from '../hooks/useStableOptions';
import { useCallbackRefs } from '../hooks/useCallbackRefs';
import type { ElementChangeEvent } from '../types';
import type { BaseElement } from '@teya/teya-blocks-js';

export interface CardFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic factory; specific types applied by consumers via TOptions
  options?: any;
  onReady?: () => void;
  onChange?: (event: ElementChangeEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface CardFieldConfig {
  elementType: string;
  ariaLabel: string;
  displayName: string;
}

/**
 * Factory function to create card field components (CardNumber, CardExpiry, CardCvc).
 * These components share identical logic and differ only in element type and aria label.
 */
export function createCardFieldComponent<TOptions = Record<string, unknown>>(
  config: CardFieldConfig
) {
  function CardFieldComponent({
    options,
    onReady,
    onChange,
    onFocus,
    onBlur,
    className,
    style,
  }: CardFieldProps & { options?: TOptions }) {
    const { teya } = useTeyaBlocksLoader();
    const elementRef = useRef<HTMLDivElement>(null);
    const [element, setElement] = useState<BaseElement | null>(null);
    const mountedRef = useRef(false);
    const optionsKey = useStableOptions(options);
    const optionsRef = useRef(options);

    const callbacksRef = useCallbackRefs({ onReady, onChange, onFocus, onBlur });

    useEffect(() => {
      if (!teya || !elementRef.current || mountedRef.current) return;

      let fieldElement: BaseElement;
      try {
        fieldElement = teya.elements.create(config.elementType, {
          ...options,
          onReady: () => callbacksRef.current.onReady?.(),
          onChange: (e: ElementChangeEvent) => callbacksRef.current.onChange?.(e),
          onFocus: () => callbacksRef.current.onFocus?.(),
          onBlur: () => callbacksRef.current.onBlur?.(),
        });
        fieldElement.mount(elementRef.current);
        mountedRef.current = true;

        setElement(fieldElement);
      } catch (error) {
        console.error(`[Teya Blocks] Failed to create/mount ${config.displayName}:`, error);
        return;
      }

      return () => {
        mountedRef.current = false;
        try {
          fieldElement.unmount();
          fieldElement.destroy();
        } catch (error) {
          console.error(`[Teya Blocks] Error during ${config.displayName} cleanup:`, error);
        }
      };
    }, [teya]); // eslint-disable-line react-hooks/exhaustive-deps -- callbacks accessed via stable refs; options tracked separately

    useEffect(() => {
      optionsRef.current = options;
    }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey is the serialized form of options

    useEffect(() => {
      if (element && optionsRef.current) {
        element.update(optionsRef.current);
      }
    }, [element, optionsKey]);

    return (
      <div
        ref={elementRef}
        className={className}
        role="textbox"
        aria-label={config.ariaLabel}
        style={{
          minHeight: '40px',
          ...style,
        }}
      />
    );
  }

  CardFieldComponent.displayName = config.displayName;
  return CardFieldComponent;
}

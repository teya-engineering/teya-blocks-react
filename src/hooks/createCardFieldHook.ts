import { useRef, useEffect, type RefObject } from 'react';
import { useTeyaBlocksLoader } from './useTeyaBlocks';
import { useStableOptions } from './useStableOptions';
import { useCallbackRefs } from './useCallbackRefs';
import type { ElementChangeEvent } from '../types';
import type { BaseElement } from '../types';

export interface CardFieldHookOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic factory; specific types applied by consumers
  options?: any;
  onReady?: () => void;
  onChange?: (event: ElementChangeEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface CardFieldHookResult {
  elementRef: RefObject<HTMLDivElement | null>;
}

interface CardFieldHookConfig {
  elementType: string;
  displayName: string;
}

/**
 * Factory function to create card field hooks (useCardNumber, useCardExpiry, useCardCvc).
 * These hooks share identical logic and differ only in element type.
 */
export function createCardFieldHook(config: CardFieldHookConfig) {
  return function useCardField(hookConfig?: CardFieldHookOptions): CardFieldHookResult {
    const { teya } = useTeyaBlocksLoader();
    const elementRef = useRef<HTMLDivElement>(null);
    const blockRef = useRef<BaseElement | null>(null);

    const optionsKey = useStableOptions(hookConfig?.options);
    const optionsRef = useRef(hookConfig?.options);

    useEffect(() => {
      optionsRef.current = hookConfig?.options;
    }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- optionsKey is the serialized form of options

    const callbacksRef = useCallbackRefs({
      onReady: hookConfig?.onReady,
      onChange: hookConfig?.onChange,
      onFocus: hookConfig?.onFocus,
      onBlur: hookConfig?.onBlur,
    });

    useEffect(() => {
      if (!teya || !elementRef.current) {
        return;
      }

      let element: BaseElement;
      try {
        element = teya.elements.create(config.elementType, {
          ...optionsRef.current,
          onReady: () => callbacksRef.current.onReady?.(),
          onChange: (e: ElementChangeEvent) => callbacksRef.current.onChange?.(e),
          onFocus: () => callbacksRef.current.onFocus?.(),
          onBlur: () => callbacksRef.current.onBlur?.(),
        });
        blockRef.current = element;

        element.mount(elementRef.current);
      } catch (error) {
        console.error(`[Teya Blocks] Failed to create/mount ${config.displayName}:`, error);
        return;
      }

      return () => {
        try {
          element.unmount();
          element.destroy();
        } catch (error) {
          console.error(`[Teya Blocks] Error during ${config.displayName} cleanup:`, error);
        }
        blockRef.current = null;
      };
    }, [teya, optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- callbacks accessed via stable refs

    return { elementRef };
  };
}

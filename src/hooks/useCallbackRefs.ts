import { useRef, useEffect } from 'react';

/**
 * Stores callbacks in a ref and keeps them up-to-date on every render.
 * This prevents stale closures when callbacks are used inside effects
 * while avoiding effect re-runs from callback identity changes.
 *
 * @param callbacks - Object of callback functions
 * @returns Ref that always contains the latest callbacks
 *
 * @example
 * ```tsx
 * function useMyElement(config?: { onReady?: () => void; onChange?: (e: Event) => void }) {
 *   const callbacksRef = useCallbackRefs({
 *     onReady: config?.onReady,
 *     onChange: config?.onChange,
 *   });
 *
 *   useEffect(() => {
 *     const element = teya.elements.create('card', {
 *       onReady: () => callbacksRef.current.onReady?.(),
 *       onChange: (e) => callbacksRef.current.onChange?.(e),
 *     });
 *   }, []);
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic callback constraint requires any for arbitrary function signatures
export function useCallbackRefs<T extends Record<string, ((...args: any[]) => any) | undefined>>(
  callbacks: T
): React.MutableRefObject<T> {
  const ref = useRef(callbacks);

  useEffect(() => {
    ref.current = callbacks;
  });

  return ref;
}

import { useMemo, useRef } from 'react';

/** Cache for non-serializable options to provide stable fallback keys. */
interface FallbackKeyCache<T> {
  /** Counter for generating unique but stable fallback keys */
  id: number;
  /** Last options reference that failed serialization */
  lastOptions: T | undefined;
}

/**
 * Stable serialization of options to prevent unnecessary effect re-runs.
 * Uses JSON serialization to create a stable dependency key.
 *
 * @param options - Options object to serialize
 * @returns Stable string key that only changes when options values change
 *
 * @example
 * ```tsx
 * function useMyElement(config?: { options?: ElementOptions }) {
 *   const optionsKey = useStableOptions(config?.options);
 *
 *   useEffect(() => {
 *     // This effect will re-run when options values change,
 *     // not just when the object reference changes
 *   }, [optionsKey]);
 * }
 * ```
 */
export function useStableOptions<T>(options: T | undefined): string {
  const fallbackCacheRef = useRef<FallbackKeyCache<T>>({ id: 0, lastOptions: undefined });

  return useMemo(() => {
    if (!options) return '';
    try {
      return JSON.stringify(options, Object.keys(options as object).sort());
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[Teya Blocks] Failed to serialize options for stable comparison. ' +
            'This may cause unnecessary re-renders if options contain non-serializable values.',
          error
        );
      }
      if (fallbackCacheRef.current.lastOptions !== options) {
        fallbackCacheRef.current.lastOptions = options;
        fallbackCacheRef.current.id += 1;
      }
      return `unstable-${fallbackCacheRef.current.id}`;
    }
  }, [options]);
}

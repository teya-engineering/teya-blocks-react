import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';

interface TeyaBlocksContextValue {
  teya: TeyaBlocks | null;
  loading: boolean;
  error: Error | null;
}

const TeyaBlocksContext = createContext<TeyaBlocksContextValue>({
  teya: null,
  loading: true,
  error: null,
});

export interface TeyaBlocksProviderProps {
  /**
   * TeyaBlocks instance or Promise from initTeyaBlocks()
   */
  teya: TeyaBlocks | Promise<TeyaBlocks | null> | null;
  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Provider component for Teya Blocks SDK.
 *
 * @example
 * ```tsx
 * import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
 * import { TeyaBlocksProvider, CardElement } from '@teyaproduct/teya-blocks-react';
 *
 * const teya = initTeyaBlocks('pk_live_xxx');
 *
 * function App() {
 *   return (
 *     <TeyaBlocksProvider teya={teya}>
 *       <CardElement />
 *     </TeyaBlocksProvider>
 *   );
 * }
 * ```
 */
export function TeyaBlocksProvider({ teya, children }: TeyaBlocksProviderProps) {
  const [state, setState] = useState<TeyaBlocksContextValue>(() => {
    if (teya && !(teya instanceof Promise)) {
      return { teya, loading: false, error: null };
    }
    return { teya: null, loading: true, error: null };
  });

  useEffect(() => {
    let isMounted = true;

    if (teya instanceof Promise) {
      const resolve = async () => {
        try {
          const instance = await teya;
          if (isMounted) {
            setState({ teya: instance, loading: false, error: null });
          }
        } catch (err) {
          if (isMounted) {
            setState({
              teya: null,
              loading: false,
              error: err instanceof Error ? err : new Error(String(err)),
            });
          }
        }
      };
      resolve();
    } else if (teya) {
      setState({ teya, loading: false, error: null });
    } else {
      setState({ teya: null, loading: false, error: null });
    }

    return () => {
      isMounted = false;
    };
  }, [teya]);

  return <TeyaBlocksContext.Provider value={state}>{children}</TeyaBlocksContext.Provider>;
}

/**
 * Internal hook to access context value.
 * @internal
 */
export function useTeyaBlocksContext(): TeyaBlocksContextValue {
  return useContext(TeyaBlocksContext);
}

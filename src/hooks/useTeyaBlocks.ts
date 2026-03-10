import type { TeyaBlocks } from '@teyaproduct/teya-blocks-js';
import { useTeyaBlocksContext } from '../context/TeyaBlocksContext';

/**
 * Hook to access the TeyaBlocks instance.
 * Throws if SDK is not loaded yet.
 *
 * @example
 * ```tsx
 * function PaymentButton() {
 *   const teya = useTeyaBlocks();
 *
 *   const handleClick = () => {
 *     // Use teya instance
 *   };
 * }
 * ```
 */
export function useTeyaBlocks(): TeyaBlocks {
  const { teya, loading, error } = useTeyaBlocksContext();

  if (loading) {
    throw new Error(
      '[Teya Blocks] SDK is still loading. Use useTeyaBlocksLoader() to handle loading state.'
    );
  }

  if (!teya) {
    throw new Error(
      `[Teya Blocks] SDK failed to load. Ensure TeyaBlocksProvider has a valid teya prop.${error ? ` Cause: ${error.message}` : ''}`
    );
  }

  return teya;
}

/**
 * Hook to access TeyaBlocks with loading state.
 *
 * @example
 * ```tsx
 * function PaymentForm() {
 *   const { teya, loading, isReady } = useTeyaBlocksLoader();
 *
 *   if (loading) return <Spinner />;
 *   if (!isReady) return <Error />;
 *
 *   return <CardElement />;
 * }
 * ```
 */
export function useTeyaBlocksLoader() {
  const { teya, loading, error } = useTeyaBlocksContext();

  return {
    teya,
    loading,
    error,
    isReady: !loading && teya !== null,
  };
}

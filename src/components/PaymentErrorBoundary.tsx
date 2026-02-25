import { Component, type ReactNode, type ErrorInfo } from 'react';

export interface PaymentErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export interface PaymentErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Custom fallback component to render when an error occurs
   * If not provided, a default error message is shown
   */
  fallback?: ReactNode | ((props: PaymentErrorFallbackProps) => ReactNode);

  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Callback when error is reset
   */
  onReset?: () => void;
}

type PaymentErrorBoundaryState =
  | { hasError: false; error: null }
  | { hasError: true; error: Error };

/**
 * Error boundary component for payment elements.
 * Catches rendering errors and provides a fallback UI.
 *
 * @example
 * ```tsx
 * <PaymentErrorBoundary
 *   onError={(error) => console.error('Payment error:', error)}
 *   fallback={({ error, resetError }) => (
 *     <div>
 *       <p>Payment form failed to load</p>
 *       <button onClick={resetError}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <CardElement />
 * </PaymentErrorBoundary>
 * ```
 */
export class PaymentErrorBoundary extends Component<
  PaymentErrorBoundaryProps,
  PaymentErrorBoundaryState
> {
  constructor(props: PaymentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PaymentErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Teya Blocks] Payment element error:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Teya Blocks] Component stack:', errorInfo.componentStack);
    }

    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error,
          resetError: this.resetError,
        });
      }

      if (fallback !== undefined) {
        return fallback;
      }

      return (
        <div
          style={{
            padding: '16px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: '#fafafa',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 8px', color: '#666' }}>
            Payment form failed to load
          </p>
          <button
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

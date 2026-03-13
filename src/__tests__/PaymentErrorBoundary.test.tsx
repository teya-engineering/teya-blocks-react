import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentErrorBoundary } from '../components/PaymentErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Child content</div>;
}

describe('PaymentErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <PaymentErrorBoundary>
        <div>Hello</div>
      </PaymentErrorBoundary>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders default fallback when child throws', () => {
    render(
      <PaymentErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    expect(screen.getByText('Payment form failed to load')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders ReactNode fallback when provided', () => {
    render(
      <PaymentErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('renders function fallback with error and resetError', () => {
    render(
      <PaymentErrorBoundary
        fallback={({ error, resetError }) => (
          <div>
            <span>{error.message}</span>
            <button onClick={resetError}>Reset</button>
          </div>
        )}
      >
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('calls onError callback when child throws', () => {
    const onError = vi.fn();

    render(
      <PaymentErrorBoundary onError={onError}>
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('resets error state when retry is clicked (default fallback)', () => {
    const { rerender } = render(
      <PaymentErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    expect(screen.getByText('Payment form failed to load')).toBeInTheDocument();

    // Rerender with non-throwing child before clicking retry
    rerender(
      <PaymentErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </PaymentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Retry'));

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('calls onReset when error is reset', () => {
    const onReset = vi.fn();

    const { rerender } = render(
      <PaymentErrorBoundary onReset={onReset}>
        <ThrowingChild shouldThrow={true} />
      </PaymentErrorBoundary>
    );

    rerender(
      <PaymentErrorBoundary onReset={onReset}>
        <ThrowingChild shouldThrow={false} />
      </PaymentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Retry'));

    expect(onReset).toHaveBeenCalled();
  });
});

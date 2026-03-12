import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton, skeletonStyleManager } from '../components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  beforeEach(() => {
    skeletonStyleManager.reset();
    const existing = document.getElementById('teya-skeleton-styles');
    if (existing) existing.remove();
  });

  it('renders with default props', () => {
    render(<LoadingSkeleton />);

    const el = screen.getByRole('progressbar');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Loading...');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with custom height and width', () => {
    render(<LoadingSkeleton height={60} width="50%" />);

    const el = screen.getByRole('progressbar');
    expect(el.style.height).toBe('60px');
    expect(el.style.width).toBe('50%');
  });

  it('renders with string height', () => {
    render(<LoadingSkeleton height="5rem" />);

    const el = screen.getByRole('progressbar');
    expect(el.style.height).toBe('5rem');
  });

  it('applies custom className and style', () => {
    render(
      <LoadingSkeleton className="my-skeleton" style={{ backgroundColor: 'red' }} />
    );

    const el = screen.getByRole('progressbar');
    expect(el).toHaveClass('my-skeleton');
    expect(el.style.backgroundColor).toBe('red');
  });

  it('renders with custom ariaLabel', () => {
    render(<LoadingSkeleton ariaLabel="Loading card input" />);

    expect(screen.getByLabelText('Loading card input')).toBeInTheDocument();
  });

  it('injects animation styles into document head', () => {
    render(<LoadingSkeleton />);

    const styleEl = document.getElementById('teya-skeleton-styles');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('teya-skeleton-pulse');
  });

  it('removes animation styles on unmount when last instance', () => {
    const { unmount } = render(<LoadingSkeleton />);

    expect(document.getElementById('teya-skeleton-styles')).not.toBeNull();

    unmount();

    expect(document.getElementById('teya-skeleton-styles')).toBeNull();
  });

  it('does not remove styles when other instances still mounted', () => {
    const { unmount: unmount1 } = render(<LoadingSkeleton />);
    render(<LoadingSkeleton />);

    unmount1();

    expect(document.getElementById('teya-skeleton-styles')).not.toBeNull();
  });

  it('does not inject styles when animate is false', () => {
    render(<LoadingSkeleton animate={false} />);

    const el = screen.getByRole('progressbar');
    expect(el.style.animation).toBe('');
    expect(document.getElementById('teya-skeleton-styles')).toBeNull();
  });

  it('applies pulse animation when animate is true', () => {
    render(<LoadingSkeleton animate={true} />);

    const el = screen.getByRole('progressbar');
    expect(el.style.animation).toContain('teya-skeleton-pulse');
  });
});

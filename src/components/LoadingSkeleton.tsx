import React, { useEffect } from 'react';

export interface LoadingSkeletonProps {
  /**
   * Height of the skeleton
   */
  height?: number | string;
  /**
   * Width of the skeleton
   */
  width?: number | string;
  /**
   * Whether to show animation
   */
  animate?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

const defaultStyles: React.CSSProperties = {
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  display: 'block',
};

const STYLE_ID = 'teya-skeleton-styles';
const pulseAnimation = `
@keyframes teya-skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
`;

/**
 * Manages skeleton animation styles with proper ref counting.
 * Uses a class to encapsulate state and allow testing/SSR isolation.
 */
class SkeletonStyleManager {
  private refCount = 0;

  /**
   * Injects skeleton animation styles into the document head.
   * Ref-counted to support multiple LoadingSkeleton instances.
   */
  inject(): void {
    if (typeof document === 'undefined') return;

    this.refCount++;

    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.textContent = pulseAnimation;
    document.head.appendChild(styleElement);
  }

  /**
   * Removes skeleton animation styles when no components need them.
   */
  remove(): void {
    if (typeof document === 'undefined') return;

    this.refCount--;

    if (this.refCount <= 0) {
      this.refCount = 0;
      const styleElement = document.getElementById(STYLE_ID);
      if (styleElement) {
        styleElement.remove();
      }
    }
  }

  /**
   * Resets the manager state. Useful for testing isolation.
   * @internal
   */
  reset(): void {
    this.refCount = 0;
  }
}

export const skeletonStyleManager = new SkeletonStyleManager();

/**
 * Loading skeleton component for showing placeholder content during async operations.
 *
 * @example
 * ```tsx
 * <LoadingSkeleton height={40} />
 * ```
 */
export function LoadingSkeleton({
  height = 40,
  width = '100%',
  animate = true,
  className,
  style,
  ariaLabel = 'Loading...',
}: LoadingSkeletonProps) {
  useEffect(() => {
    if (!animate) {
      return;
    }
    skeletonStyleManager.inject();
    return () => skeletonStyleManager.remove();
  }, [animate]);

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-busy="true"
      className={className}
      style={{
        ...defaultStyles,
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        animation: animate ? 'teya-skeleton-pulse 1.5s ease-in-out infinite' : undefined,
        ...style,
      }}
    />
  );
}

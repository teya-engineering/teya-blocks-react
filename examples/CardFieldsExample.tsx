import React, { useMemo, useState } from 'react';
import { initTeyaBlocks } from '@teyaproduct/teya-blocks-js';
import {
  TeyaBlocksProvider,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@teyaproduct/teya-blocks-react';

/**
 * Individual Card Field Examples
 *
 * Use CardNumberElement, CardExpiryElement, and CardCvcElement
 * for full control over card form layout. These are useful when
 * you need custom styling or positioning of each field.
 */

// --- Basic split card fields ---

export function BasicCardFields({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <div>
        <label>Card Number</label>
        <CardNumberElement onChange={(e) => console.log('Number:', e)} />

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label>Expiry</label>
            <CardExpiryElement onChange={(e) => console.log('Expiry:', e)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>CVC</label>
            <CardCvcElement onChange={(e) => console.log('CVC:', e)} />
          </div>
        </div>
      </div>
    </TeyaBlocksProvider>
  );
}

// --- Styled card fields with validation state ---

export function StyledCardFields({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(() => initTeyaBlocks(sessionToken), [sessionToken]);

  const [fieldState, setFieldState] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false },
  });

  const fieldStyle = (field: keyof typeof fieldState): React.CSSProperties => ({
    border: `1px solid ${fieldState[field].focused ? '#0066ff' : '#ccc'}`,
    borderRadius: '4px',
    padding: '8px',
    transition: 'border-color 0.2s',
  });

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <div style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Card Number</label>
          <CardNumberElement
            style={fieldStyle('number')}
            onChange={(e) =>
              setFieldState((s) => ({
                ...s,
                number: { ...s.number, complete: e.complete },
              }))
            }
            onFocus={() =>
              setFieldState((s) => ({
                ...s,
                number: { ...s.number, focused: true },
              }))
            }
            onBlur={() =>
              setFieldState((s) => ({
                ...s,
                number: { ...s.number, focused: false },
              }))
            }
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Expiry Date</label>
            <CardExpiryElement
              style={fieldStyle('expiry')}
              onChange={(e) =>
                setFieldState((s) => ({
                  ...s,
                  expiry: { ...s.expiry, complete: e.complete },
                }))
              }
              onFocus={() =>
                setFieldState((s) => ({
                  ...s,
                  expiry: { ...s.expiry, focused: true },
                }))
              }
              onBlur={() =>
                setFieldState((s) => ({
                  ...s,
                  expiry: { ...s.expiry, focused: false },
                }))
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>CVC</label>
            <CardCvcElement
              style={fieldStyle('cvc')}
              onChange={(e) =>
                setFieldState((s) => ({
                  ...s,
                  cvc: { ...s.cvc, complete: e.complete },
                }))
              }
              onFocus={() =>
                setFieldState((s) => ({
                  ...s,
                  cvc: { ...s.cvc, focused: true },
                }))
              }
              onBlur={() =>
                setFieldState((s) => ({
                  ...s,
                  cvc: { ...s.cvc, focused: false },
                }))
              }
            />
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
          {fieldState.number.complete && fieldState.expiry.complete && fieldState.cvc.complete
            ? 'All fields complete'
            : 'Please fill in all card details'}
        </p>
      </div>
    </TeyaBlocksProvider>
  );
}

// --- Using hooks for individual card fields ---

export { HookCardFields } from './CardFieldsHookExample';

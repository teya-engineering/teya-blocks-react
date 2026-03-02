import React, { useMemo } from 'react';
import { loadTeyaBlocks } from '@teya/teya-blocks-js';
import {
  TeyaBlocksProvider,
  useCardNumberElement,
  useCardExpiryElement,
  useCardCvcElement,
} from '@teya-blocks/react';

/**
 * Card Fields Hook Example
 *
 * Uses the individual card field hooks for maximum control over
 * layout and behavior. Each hook returns a ref to attach to a
 * container <div>.
 */

function CardFieldsForm() {
  const { cardNumberElementRef } = useCardNumberElement({
    onChange: (e) => console.log('Number changed:', e),
  });

  const { cardExpiryElementRef } = useCardExpiryElement({
    onChange: (e) => console.log('Expiry changed:', e),
  });

  const { cardCvcElementRef } = useCardCvcElement({
    onChange: (e) => console.log('CVC changed:', e),
  });

  return (
    <div style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>Card Number</label>
        <div ref={cardNumberElementRef} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label>Expiry</label>
          <div ref={cardExpiryElementRef} />
        </div>
        <div style={{ flex: 1 }}>
          <label>CVC</label>
          <div ref={cardCvcElementRef} />
        </div>
      </div>
    </div>
  );
}

export function HookCardFields({ sessionToken }: { sessionToken: string }) {
  const teyaPromise = useMemo(
    () => loadTeyaBlocks(sessionToken),
    [sessionToken]
  );

  return (
    <TeyaBlocksProvider teya={teyaPromise}>
      <CardFieldsForm />
    </TeyaBlocksProvider>
  );
}

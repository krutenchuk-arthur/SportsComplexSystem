import { useEffect, useState } from 'react';
import { subscribeToRealtimeStatus } from '../api/realtime';

/**
 * Стан з'єднання з SignalR-хабом.
 * Використовується для індикатора «Live» у хедері та підказок про офлайн-режим.
 */
export function useRealtimeStatus(enabled = true): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    return subscribeToRealtimeStatus(setConnected);
  }, [enabled]);

  return connected;
}

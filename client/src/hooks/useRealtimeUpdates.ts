import { useEffect, useRef } from 'react';
import { subscribeToDataChanges } from '../api/realtime';

/**
 * Підписує компонент на SignalR-події DataChanged.
 * Колбек завжди актуальний (через ref), підписка створюється один раз.
 */
export function useRealtimeUpdates(onChange: (entityType: string) => void, enabled = true) {
  const handlerRef = useRef(onChange);
  handlerRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    return subscribeToDataChanges((entityType) => handlerRef.current(entityType));
  }, [enabled]);
}

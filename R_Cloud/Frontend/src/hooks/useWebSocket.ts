/**
 * useWebSocket — real WebSocket connection to the API Gateway.
 * Subscribes to NATS-forwarded events: deployment.*, runtime.*, health.*
 * Provides live connection status and the last received event.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export type WebSocketEventType =
  | 'deployment.created'
  | 'deployment.validated'
  | 'deployment.planned'
  | 'deployment.completed'
  | 'deployment.failed'
  | 'runtime.started'
  | 'runtime.stopped'
  | 'runtime.restarted'
  | 'runtime.failed'
  | 'health.failed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastEvent: WebSocketEvent | null;
  events: WebSocketEvent[];
}

const MAX_EVENTS = 100;
const RECONNECT_INTERVAL_MS = 5000;

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
      };

      socket.onmessage = (messageEvent: MessageEvent) => {
        if (!isMountedRef.current) return;
        try {
          const event: WebSocketEvent = JSON.parse(messageEvent.data as string);
          setLastEvent(event);
          setEvents((previous) => {
            const updated = [event, ...previous];
            return updated.slice(0, MAX_EVENTS);
          });
        } catch {
          // Non-JSON messages are ignored.
        }
      };

      socket.onclose = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL_MS);
      };

      socket.onerror = () => {
        // onerror is always followed by onclose, so reconnect is handled there.
        socket.close();
      };
    } catch {
      // If WebSocket constructor throws (e.g. invalid URL), retry after delay.
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL_MS);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return { isConnected, lastEvent, events };
}

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * useSlotUpdates — subscribes to real-time slot availability updates
 * for a specific clinic via WebSocket (STOMP over SockJS).
 *
 * @param {number} clinicId  - clinic to subscribe to
 * @param {function} onUpdate - callback({ clinicId, slotId, isBooked })
 */
export function useSlotUpdates(clinicId, onUpdate) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!clinicId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API}/ws`),
      onConnect: () => {
        client.subscribe(`/topic/slots/${clinicId}`, (msg) => {
          try {
            const update = JSON.parse(msg.body);
            onUpdate(update);
          } catch {}
        });
      },
      reconnectDelay: 3000,
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [clinicId]);
}

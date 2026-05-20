import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useBookingUpdates(topic, onUpdate) {
  const clientRef   = useRef(null);
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!topic) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/bookings/${topic}`, (msg) => {
          try {
            const update = JSON.parse(msg.body);
            callbackRef.current(update);
          } catch {}
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [topic]);
}
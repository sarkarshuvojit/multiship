import type { InboundEvent, OutboundEvent } from "@/types/wsevents";

const RECONNECT_DELAY_MS = 2000;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private url = '';

  onMessage?: (event: OutboundEvent) => void;
  onClose?: () => void;

  connect(url: string) {
    this.url = url;
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      try {
        this.onMessage?.(JSON.parse(event.data));
      } catch (err) {
        console.error('Bad message from server', err);
      }
    };
    this.socket.onclose = () => {
      this.onClose?.();
      setTimeout(() => this.connect(this.url), RECONNECT_DELAY_MS);
    };
  }

  send<T>(event: InboundEvent<T>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }
}

export const wsClient = new WebSocketClient();

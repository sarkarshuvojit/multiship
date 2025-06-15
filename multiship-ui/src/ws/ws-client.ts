import type { InboundEvent, OutboundEvent } from "@/types/wsevents";

class WebSocketClient {
  private socket: WebSocket | null = null;

  connect(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.onMessage?.(message);
    };
  }

  send(event: InboundEvent) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  onMessage?: (event: OutboundEvent) => void;
}

export const wsClient = new WebSocketClient();


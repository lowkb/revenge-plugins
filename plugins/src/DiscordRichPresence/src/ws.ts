import { EventEmitter } from "events";

export default class WebSocketTransport extends EventEmitter {
    ws: WebSocket | null = null;
    tries = 0;

    constructor(public clientId: string) {
        super();
    }

    connect() {
        const port = 6463 + (this.tries % 10);
        this.tries++;
        this.ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=${this.clientId}`);
        this.ws.onopen = () => this.emit("open");
        this.ws.onclose = (e) => this.emit("close", e);
        this.ws.onerror = () => setTimeout(() => this.connect(), 250);
        this.ws.onmessage = (msg) => this.emit("message", JSON.parse(msg.data));
    }

    send(data: any) {
        this.ws?.send(JSON.stringify(data));
    }
}

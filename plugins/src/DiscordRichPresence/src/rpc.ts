
import type { Activity } from "./types";

type EventCallback = (...args: any[]) => void;

export default class WebSocketTransport {
    ws: WebSocket | null = null;
    tries = 0;
    private listeners: Record<string, EventCallback[]> = {};

    constructor(public clientId: string) {}

    on(event: string, cb: EventCallback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
    }

    off(event: string, cb: EventCallback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(fn => fn !== cb);
    }

    emit(event: string, ...args: any[]) {
        if (!this.listeners[event]) return;
        for (const cb of this.listeners[event]) cb(...args);
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

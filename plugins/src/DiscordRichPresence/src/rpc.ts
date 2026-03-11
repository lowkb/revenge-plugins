export type Callback = (...args: any[]) => void;

export class MiniEmitter {
    private listeners: Record<string, Callback[]> = {};

    on(event: string, cb: Callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
    }

    once(event: string, cb: Callback) {
        const wrapper = (...args: any[]) => {
            cb(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    off(event: string, cb: Callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(c => c !== cb);
    }

    emit(event: string, ...args: any[]) {
        this.listeners[event]?.forEach(c => c(...args));
    }
}

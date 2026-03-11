import { EventEmitter } from "events";
import net from "net";

function getIPCPath(id: number) {
    if (process.platform === "win32") return `\\\\?\\pipe\\discord-ipc-${id}`;
    return `/tmp/discord-ipc-${id}`;
}

async function getIPC(id = 0): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
        const sock = net.createConnection(getIPCPath(id), () => resolve(sock));
        sock.once("error", () => {
            if (id < 10) resolve(getIPC(id + 1));
            else reject(new Error("Could not connect"));
        });
    });
}

export default class IPCTransport extends EventEmitter {
    socket: net.Socket | null = null;

    constructor(public clientId: string) {
        super();
    }

    async connect() {
        this.socket = await getIPC();
        this.socket.on("close", (e) => this.emit("close", e));
        this.emit("open");
    }

    send(data: any) {
        if (!this.socket) return;
        const str = JSON.stringify(data);
        const len = Buffer.byteLength(str);
        const packet = Buffer.alloc(8 + len);
        packet.writeInt32LE(1, 0); // OPCODE FRAME
        packet.writeInt32LE(len, 4);
        packet.write(str, 8);
        this.socket.write(packet);
    }
}

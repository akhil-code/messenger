import { Server as IoServer } from "socket.io"
import * as http from "http"

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
    chatMessage: (msg: string) => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

export function createWebSocket(httpServer: http.Server) {
    // create server
    return new IoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer)
}

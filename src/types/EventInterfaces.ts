export interface ServerToClientEvents {
}

export interface ClientToServerEvents {
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    age: number;
}
import { Message } from './conversation'

export interface ServerToClientEvents {
    groupMessage: (message: Message) => void;
    directMessage: (message: Message) => void;
}

export interface ClientToServerEvents {
    groupMessage: (message: Message) => void;
    directMessage: (message: Message) => void;
}

export interface InterServerEvents {
    ping: () => void;
}
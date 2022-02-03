import { Message } from './conversation'

export interface ServerToClientEvents {
    groupMessage: (message: Message) => void;
    directMessage: (message: Message) => void;

}

export interface ClientToServerEvents {
    groupMessage: (message: Message) => void;
    directMessage: (message: Message) => void;
    joinRoom: (location: string, roomName: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
    joinRoom: (location: string, roomName: string) => void;

}
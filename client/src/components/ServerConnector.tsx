import React, { Component } from "react";
import { io, Socket } from "socket.io-client";

interface Props {}

interface State {}

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

class ServerConnector extends Component<Props, State> {
    componentDidMount() {
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
        socket.on("connect", () => console.log(`connection successful witih socket id: ${socket.id}`))
    }

    render() {
        return <button>Connect to Server</button>;
    }
}

export default ServerConnector;

import React, { Component } from "react";
import { io, Socket } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {
    socket?: Socket;
    updateSocket: (socket?: Socket) => void;
    addToConversation: (line: string) => void;
}

interface State {
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
}

interface ServerToClientEvents {
    directMessage: (message: string) => void;
}

interface ClientToServerEvents {
    directMessage: (message: string) => void;
}

class ServerConnector extends Component<Props, State> {
    state = {
        socket: undefined,
    };

    connectToSocketServer = () => {
        console.log(`attempting to connect to socket server`);
        // connect to socket server
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
        socket.on(`connect`, () => {
            console.log(
                `connection successful with server with socket id: ${socket.id}`
            );

            this.props.updateSocket(socket)
            this.addEventListeners(socket);
        });
    };

    disconnectFromSocketServer = (
        socket?: Socket<ServerToClientEvents, ClientToServerEvents>
    ) => {
        if (socket !== undefined) {
            console.log(`attempting to disconnect from socket server`);
            socket.disconnect();
            this.props.updateSocket(undefined)
        }
    };

    addEventListeners = (socket: Socket) => {
        socket.on('conversationItem', (message) => {
            this.props.addToConversation(message)
        })
    };

    renderConnectionInfo = (
        socket?: Socket<ServerToClientEvents, ClientToServerEvents>
    ) => {
        if (socket === undefined) {
            return <p>Status: Disconnected</p>;
        } else {
            return (
                <div>
                    <p>Status: Connected with socketId {socket.id}</p>
                </div>
            );
        }
    };

    render() {
        return (
            <div>
                <h3>Connection Manager</h3>
                {this.renderConnectionInfo(this.props.socket)}
                <button
                    onClick={() => this.connectToSocketServer()}
                    disabled={this.props.socket !== undefined}
                >
                    Connect to Server
                </button>
                <button
                    onClick={() =>
                        this.disconnectFromSocketServer(this.props.socket)
                    }
                    disabled={this.props.socket === undefined}
                >
                    Disconnect from Server
                </button>
            </div>
        );
    }
}

export default ServerConnector;
import React, { Component } from "react";
import MessageEditor from "./messageEditor";
import ServerConnector from "./serverConnector";
import AvaiableRooms from './availableSockets';
import ChatHistory from "./chatHistory";
import { Socket } from "socket.io-client";

interface Props {}

interface State {
    socket?: Socket
    destSocketId?: string
    conversation: Array<string>
}

class Chat extends Component<Props, State> {
    state = {
        socket: undefined,
        destSocketId: undefined,
        conversation: []
    }

    updateSocket = (socket?: Socket) => {
        this.setState({
          ...this.state,
          socket
        })
    }

    getAvailableRooms = () => {
        // make call to backend
    }

    addToConversation = (line: string) => {
        this.setState({
            ...this.state,
            conversation: [...this.state.conversation, line]
        })
    }

    openChat = (destSocketId: string) => {
        this.setState({
            ...this.state,
            destSocketId
        })
    }

    render() {
        return (
            <React.Fragment>
                <ServerConnector updateSocket={this.updateSocket} socket={this.state.socket} addToConversation={this.addToConversation} />
                <br/>
                <AvaiableRooms openChat={this.openChat}/>
                <MessageEditor socket={this.state.socket} targetSocketId={this.state.destSocketId}/>
                <br/>
                <ChatHistory conversation={this.state.conversation} />
            </React.Fragment>
        );
    }
}

export default Chat;

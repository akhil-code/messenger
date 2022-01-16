import React, { Component } from "react";
import { Socket } from "socket.io-client";

interface Props {
    socket?: Socket,
    targetSocketId?: string
}

interface State {
    message: string
}

class MessageEditor extends Component<Props, State> {

    state = {
        message: ""
    }

    handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            message: event.target.value
        })
    }

    sendMessageHandler = (event: React.SyntheticEvent) => {
        event.preventDefault();
        // send message event
        let socket = this.props.socket
        let message = this.state.message

        if(socket !== undefined && message !== "" && this.props.targetSocketId !== undefined) {
            socket.emit("message", {
                message,
                receiver: this.props.targetSocketId
            })
        }
        
        this.setState({
            message: ""
        })
    }

    renderTargetChat = () => {
        let targetSocketId = this.props.targetSocketId
        if(targetSocketId === undefined) {
            return <p>Please choose a socket to start a conversation</p>
        } else {
            return (
                <div>
                    <p>Selected destination: {targetSocketId}</p>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <h3>Message Editor</h3>
                {this.renderTargetChat()}
                <form>
                    <input type="text" onChange={this.handleMessageChange} value={this.state.message}></input>
                    <button type="submit" onClick={this.sendMessageHandler} disabled={this.state.message === ""}>Send</button>
                </form>
            </div>
        );
    }
}

export default MessageEditor;

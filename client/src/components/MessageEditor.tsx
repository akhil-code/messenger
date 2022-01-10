import React, { Component } from "react";

interface Props {}

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
    }

    render() {
        return (
            <form>
                <input type="text" onChange={this.handleMessageChange} value={this.state.message}></input>
                <button type="submit" onClick={this.sendMessageHandler}>Send</button>
            </form>
        );
    }
}

export default MessageEditor;

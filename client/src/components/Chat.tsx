import React, { Component } from "react";
import MessageEditor from "./MessageEditor";
import ServerConnector from "./ServerConnector";

interface Props {}

interface State {}

class Chat extends Component<Props, State> {
    render() {
        return (
            <React.Fragment>
                <ServerConnector />
                <MessageEditor />
            </React.Fragment>
        );
    }
}

export default Chat;

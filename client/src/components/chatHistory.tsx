import * as React from "react";
import { v4 as uuidv4 } from 'uuid';


interface Props {
    conversation: Array<string>

}

interface State {
}

class ChatHistory extends React.Component<Props, State> {

    renderConversation = () => {
        let conversations = this.props.conversation.map(item => JSON.stringify(item ))
        return conversations.map(item => <li key={uuidv4()}> {item} </li>); 
    }

    render() {
        return (
            <div>
                <h3>Conversation</h3>
                <ul>
                    {this.renderConversation()}
                </ul>
            </div>
        );
    }
}

export default ChatHistory;

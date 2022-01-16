import * as React from 'react';

interface Props {
    openChat: (destinationSocketId: string) => void
}
 
interface State {
    socketsList: Array<string>
}
 
class AvailableSockets extends React.Component<Props, State> {

    state = {
        socketsList: []
    }

    componentDidMount() {
        this.fetchAllSockets()
    }

    fetchAllSockets = () => {
        fetch('/sockets')
            .then(res => res.json())
            .then(res => {
                this.setState({
                    socketsList: res
                })
            })
    }

    openChat = (destinationSocketId: string) => {
        this.props.openChat(destinationSocketId)
    }

    renderAvailableSockets = () => {
        const availableSocketsDom = () => {
            const availableSocketsList = this.state.socketsList
            if(availableSocketsList === undefined) {
                return <div>No available sockets</div>
            } else {
                return (
                    <ul>
                        {availableSocketsList.map(socketId =>  
                            <a onClick={() => this.openChat(socketId)} key={socketId}>
                                <li>{socketId}</li>
                            </a>
                        )}
                    </ul>
                    
                );
            }
        }
        return (
            <div>
                <h3>Available Sockets</h3>
                <button onClick={() => this.fetchAllSockets()}>Refresh</button>
                {availableSocketsDom()}
            </div>
        );
    }

    render() { 
        return this.renderAvailableSockets();
    }
}
 
export default AvailableSockets;
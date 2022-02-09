import Session from './session.js'

export default interface MessageEvent {
    sender: Session,
    receiver: Session,
    message: string,
}
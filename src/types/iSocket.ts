import { Socket } from 'socket.io'
import Session from '../types/session.js'

export default interface ISocket extends Socket {
    session?: Session;
}
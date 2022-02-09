import { v4 as uuidv4 } from 'uuid';
import { Namespace } from "socket.io";
import SessionStore from '../datastore/sessionStore.js';
import ISocket from '../types/iSocket.js';

export const connectionMiddleware = (namespace: Namespace, sessionStore: SessionStore) => {
    return namespace.use((socket: ISocket, next) => {
        sessionStore.printSessionStore()
        
        let inputSessionId = socket.handshake.auth.sessionId;
        let sessionIdentified = sessionStore.findSessionBySessionId(inputSessionId)
        // if session exists.
        if(sessionIdentified) {
            socket.session = {
                sessionId: sessionIdentified.sessionId,
                userId: socket.id,
                username: sessionIdentified.username,
                location: sessionIdentified.location,
            }
            sessionStore.saveSession(inputSessionId, socket.session)
            return next()
        } else {
            // create new session instance if connected for first time.
            // todo: bug - if username is undefined throw error.
            let username = socket.handshake.auth.username;
            let location = socket.handshake.auth.location;

            if(username === undefined || location === undefined) {
                let error = new Error('Invalid username of location')
                console.log(`invalid username or location, throwing error`)
                return next(error)
            }


            let session = {
                sessionId: uuidv4(),
                userId: socket.id,
                username,
                location,
            }
            sessionStore.saveSession(session.sessionId, session)
            socket.session = {...session}
            next();
        }
    });
}
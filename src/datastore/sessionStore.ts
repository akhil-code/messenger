import Session from "../types/session.js";

export default class SessionStore {
    // sessionId -> Session object
    sessions: Map<string, Session>;
    // userId (socketId) -> Session object
    users: Map<string, Session>;

    constructor() {
        this.sessions = new Map();
        this.users = new Map();
    }

    /**
     * 
     * @param sessionId sessionId
     * @returns 
     */
    findSessionBySessionId(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    findUserByUserId(userId: string) {
        return this.users.get(userId)
    }

    /**
     * 
     * @param id sessionId
     * @param session session object
     */
    saveSession(id: string, session: Session) {
        this.sessions.set(id, {...session});
        this.users.set(session.userId, {...session})
    }

    deleteSession(userId: string) {
        let session = this.users.get(userId)
        this.sessions.delete(session.sessionId)
        this.users.delete(session.userId)
    }

    /**
     * 
     * @returns Returns all saved sessions.
     */
    findAllSessions() {
        return [...this.sessions.values()];
    }

    printUserStore() {
        console.log('user store: ', this.users)
    }
    
    printSessionStore() {
        console.log('session store: ', this.sessions)
    }
}

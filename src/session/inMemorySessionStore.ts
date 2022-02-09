import { Session } from "../types/session.js";

export default class InMemorySessionStore {
    sessions: Map<string, Session>;

    constructor() {
        this.sessions = new Map();
    }

    findSession(id: string) {
        return this.sessions.get(id);
    }

    saveSession(id: string, session: Session) {
        this.sessions.set(id, session);
    }

    findAllSessions() {
        return [...this.sessions.values()];
    }
}

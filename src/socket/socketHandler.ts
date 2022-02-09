import { Namespace, Server as IoServer, Socket } from "socket.io";
import * as http from "http";
import { instrument } from "@socket.io/admin-ui";
import * as socketConstants from "../constants/socketConstants.js";
import { Message } from "../types/conversation";
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
} from "../types/socketEvents";
import { getAllSupportedLocations } from "../manager/locationManager.js";
import * as callbacks from "./callbacks.js";
import { v4 as uuidv4 } from 'uuid'
import InMemorySessionStore from "../session/inMemorySessionStore.js";
import { Session } from "../types/session.js";


class SocketHandler {
    io: IoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
    sessionStore = new InMemorySessionStore();

    constructor(httpServer: http.Server) {
        this.io = new IoServer<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents
        >(httpServer, {
            cors: {
                origin: socketConstants.CORS_WHITELISTED_SITES,
                credentials: true,
            },
        });

        this.addAdminIOMiddleware();
        this.setupEventListeners();
    }

    addAdminIOMiddleware = () => {
        instrument(this.io, { auth: false });
    };

    setupLoginMiddleware = (namespace: Namespace) => {
        namespace.use((socket: ISocket, next) => {
            let inputSessionId = socket.handshake.auth.sessionId;
            let session = this.sessionStore.findSession(inputSessionId)
            if(session) {
                socket.session = {
                    sessionId: session.sessionId,
                    userId: session.userId,
                    username: session.username,
                    location: session.location,
                }
                
            } else {
                let username = socket.handshake.auth.username;
                let location = socket.handshake.auth.location;
                let session = {
                    userId: uuidv4(),
                    sessionId: uuidv4(),
                    username,
                    location,
                }
                this.sessionStore.saveSession(session.sessionId, session)
                socket.session = {...session}
            }
            next();
        });
    };

    setupEventListeners = () => {
        getAllSupportedLocations().forEach((location) => {
            let regionalNamespace = this.io.of(`/${location}`);
            this.setupLoginMiddleware(regionalNamespace);

            regionalNamespace.on("connection", async (socket: ISocket) => {
                console.log(`user in ${location} connected with socket id: ${socket.id} \n`);
                console.log(socket.session)
                socket.emit('session', socket.session)

                socket.on("groupMessage", (message: Message) =>
                    callbacks.groupMessageCallback(message, regionalNamespace)
                );
                socket.on("directMessage", (message: Message) =>
                    callbacks.directMessageCallback(message, regionalNamespace)
                );
                socket.on(
                    "joinRoom",
                    async (location: string, roomName: string) =>
                        callbacks.joinRoomCallback(
                            location,
                            roomName,
                            socket,
                            regionalNamespace,
                            this.getSocketsInChannel
                        )
                );
                // todo: handle for user exiting the channel as well
                socket.on("disconnect", async () =>
                    callbacks.disconnectionCallback(
                        socket,
                        location,
                        this.getSocketsInLocation
                    )
                );
            });
        });
    };

    getSocketsInLocation = async (location: string) => {
        return (await this.io.of(`/${location}`).fetchSockets()).length;
    };

    getSocketsInChannel = async (location: string, channelId: string) => {
        return (
            await this.io.of(`/${location}`).in(channelId).fetchSockets()
        ).map((socket) => socket.id);
    };

    getOnlineUsersOfLocation = async (location: string) => {
        return (await this.io.of(`/${location}`).fetchSockets()).map(
            (socket) => socket.id
        );
    };

    getAllOnlineUsers = async () => {
        let supportedLocations = getAllSupportedLocations();
        // key is location, value is list of users
        let usersMap = new Map<string, Array<string>>();
        await Promise.all(
            supportedLocations.map(async (location) => {
                let users = await this.getOnlineUsersOfLocation(location);
                usersMap.set(location, users);
            })
        );
        return usersMap;
    };
}

interface ISocket extends Socket {
    session?: Session;
}

export default SocketHandler;

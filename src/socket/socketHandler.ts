import { User } from './../types/user';
import { Server as IoServer } from "socket.io";
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
import SessionStore from "../datastore/sessionStore.js";
import ISocket from '../types/iSocket';
import { connectionMiddleware } from './connectionMiddleware.js'
import MessageEvent from '../types/messageEvent';

class SocketHandler {
    io: IoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
    sessionStore: SessionStore;

    constructor(httpServer: http.Server) {
        this.sessionStore = new SessionStore()
        this.io = new IoServer<ClientToServerEvents,ServerToClientEvents,InterServerEvents>(httpServer, {
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

    setupEventListeners = () => {
        getAllSupportedLocations().forEach((location) => {
            let regionalNamespace = this.io.of(`/${location}`);
            // middleware to check the necessary details.
            connectionMiddleware(regionalNamespace, this.sessionStore)

            regionalNamespace.on("connection", async (socket: ISocket) => {
                console.log(`user in ${location} connected with socket id: ${socket.id} \n`);
                socket.emit('session', socket.session)
                
                socket.on("groupMessage", (message: Message) => callbacks.groupMessageCallback(message, regionalNamespace))
                socket.on("directMessage", (messageEvent: MessageEvent) => callbacks.directMessageCallback(messageEvent, regionalNamespace))
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
                socket.on("disconnect", async () => callbacks.disconnectionCallback(socket, this.sessionStore))
            });
        });
    };

    getTotalSocketsInLocation = async (location: string) => {
        return (await this.io.of(`/${location}`).fetchSockets()).length;
    };

    getSocketsInChannel = async (location: string, channelId: string) => {
        return (await this.io.of(`/${location}`).in(channelId).fetchSockets()).map((socket) => socket.id)
    };

    /**
     * Returns all online users in a given location.
     * @param location target location
     * @returns Promise of list of users
     */
    getOnlineUsersOfLocation = async (location: string) : Promise<Array<User>> => {
        let socketIds = (await this.io.of(`/${location}`).fetchSockets()).map((socket) => socket.id);
        let res =  socketIds.map(socketId => {
            let session = this.sessionStore.findUserByUserId(socketId)
            return {
                username: session?.username,
                userId: session?.userId,
            }
        })
        // console.log(socketIds, " -> ", res)
        return res;
    };

    getAllOnlineUsers = async () => {
        let supportedLocations = getAllSupportedLocations();
        // key is location, value is list of users
        let usersMap = new Map<string, Array<User>>();
        await Promise.all(
            supportedLocations.map(async (location) => {
                let users = await this.getOnlineUsersOfLocation(location);
                usersMap.set(location, [...users]);
            })
        );
        // console.log(usersMap)
        return usersMap;
    };

    getUser = (userId: string) => {
        return this.sessionStore.findUserByUserId(userId)
    }
}



export default SocketHandler;

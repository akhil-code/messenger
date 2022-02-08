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

class SocketHandler {
    io: IoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

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

    setupEventListeners = () => {
        getAllSupportedLocations().forEach((location) => {
            let regionalNamespace = this.io.of(`/${location}`);

            regionalNamespace.on("connection", async (socket) => {
                console.log(
                    `user in ${location} connected with socket id: ${socket.id} \n`
                );
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

export default SocketHandler;

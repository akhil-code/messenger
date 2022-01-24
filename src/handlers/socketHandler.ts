import { MAX_CONVERSATIONS_STORED_PER_CHANNEL } from "../constants/channelConstants.js";
import { Server as IoServer } from "socket.io";
import * as http from "http";
import { instrument } from "@socket.io/admin-ui";
import * as conversationManager from "../cache/conversationCache.js";
import * as socketConstants from "../constants/socketConstants.js";
import { Message } from "../types/conversation";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, } from "../types/socketInterfaces";

class SocketHandler {
    ioServer: IoServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents
    >;

    constructor(httpServer: http.Server) {
        this.ioServer = new IoServer<
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
        this.initEventListeners();
    }

    start = (httpServer: http.Server) => {
        // create server object
        const ioServer = new IoServer<
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
        this.initEventListeners();
    };

    addAdminIOMiddleware = () => {
        instrument(this.ioServer, { auth: false });
    };

    /**
     * List of events to handle
     * 1. Direct message
     * 2. Channel message
     * 3. Initiate / Terminate direct message.
     * 4. Initiate / terminate group message channel.
     */
    initEventListeners = () => {
        this.ioServer.on("connection", async (socket) => {
            console.log(`user connected with socket id: ${socket.id} \n`);

            socket.on("groupMessage", (message: Message) => {
                console.log(`New group message: ${message}`);
                conversationManager.storeMessageOfChannel(
                    message.receiver,
                    message,
                    MAX_CONVERSATIONS_STORED_PER_CHANNEL
                );
                this.ioServer.emit("groupMessage", message);
            });

            socket.on("directMessage", (message: Message) => {
                socket.to(message.receiver).emit("directMessage", message);
            });

            // disconnect event
            socket.on("disconnect", async () => {
                console.log(
                    `A user disconnected with socketId: ${socket.id}, connections left: TODO`
                );
            });
        });
    };

    getAllSockets = async () => {
        return (await this.ioServer.fetchSockets()).map((socket) => socket.id);
    };
}

export default SocketHandler;

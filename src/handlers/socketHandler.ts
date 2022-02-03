import { MAX_CONVERSATIONS_STORED_PER_CHANNEL as maxConvs } from "../constants/channelConstants.js";
import { Server as IoServer } from "socket.io";
import * as http from "http";
import { instrument } from "@socket.io/admin-ui";
import * as conversationManager from "../cache/conversationCache.js";
import * as socketConstants from "../constants/socketConstants.js";
import { Message } from "../types/conversation";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, } from "../types/socketInterfaces";
import { getAllSupportedLocations } from "../manager/locationManager.js";

class SocketHandler {
    io: IoServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents
    >;

    constructor(httpServer: http.Server) {
        this.io = new IoServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents >(httpServer, {
            cors: {
                origin: socketConstants.CORS_WHITELISTED_SITES,
                credentials: true,
            },
        });

        this.addAdminIOMiddleware();
        // this.initEventListeners();
        this.setupEventListeners();
    }

    addAdminIOMiddleware = () => {
        instrument(this.io, { auth: false });
    };

    /**
     * List of events to handle
     * 1. Direct message
     * 2. Channel message
     * 3. Initiate / Terminate direct message.
     * 4. Initiate / terminate group message channel.
     */
    setupEventListeners = () => {
        let supportedLocations = getAllSupportedLocations()
        supportedLocations.forEach(location => {
            let regionalNamespace = this.io.of(`/${location}`)

            regionalNamespace.on('connection', async (socket) => {
                console.log(`user in ${location} connected with socket id: ${socket.id} \n`)

                socket.on("groupMessage", (message: Message) => {
                    console.log(`New group message: ${message}`);
                    conversationManager.storeMessageOfChannel(`${location}:${message.receiver}`, message, maxConvs)
                    regionalNamespace.to(message.receiver).emit("groupMessage", message);
                });
    
                socket.on("directMessage", (message: Message) => {
                    socket.to(message.receiver).emit("directMessage", message);
                });
    
                socket.on('joinRoom', (location: string, roomName: string) => {
                    console.log(`joining ${socket.id} to room: ${roomName}`)
                    socket.join(roomName)
                })
    
                // disconnect event
                socket.on("disconnect", async () => {
                    console.log(
                        `A user disconnected with socketId: ${socket.id}, connections left: TODO`
                    );
                });
            })


        })
    }

    getAllSockets = async () => {
        return (await this.io.fetchSockets()).map((socket) => socket.id);
    };
}

export default SocketHandler;

import { MAX_CONVERSATIONS_STORED_PER_CHANNEL as maxConvs } from "../constants/channelConstants.js";
import { Server as IoServer } from "socket.io";
import * as http from "http";
import { instrument } from "@socket.io/admin-ui";
import * as conversationManager from "../cache/conversationCache.js";
import * as socketConstants from "../constants/socketConstants.js";
import { Message } from "../types/conversation";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, } from "../types/socketEvents";
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
    
                // todo: handle for user exiting the channel as well
                socket.on('joinRoom', async (location: string, roomName: string) => {
                    console.log(`joining ${socket.id} to room: ${roomName}`)
                    // emit to the channel that new user has joined
                    socket.join(roomName)
                    regionalNamespace.to(roomName).emit('onlineUsersUpdate', 
                        roomName, (await this.getSocketsInChannel(location, roomName)))
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

    getSocketsInChannel = async (location: string, channelId: string) => {
        return (await this.io.of(`/${location}`).in(channelId).fetchSockets()).map(socket => socket.id)
    }

    getOnlineUsersOfLocation = async (location: string) => {
        return (await this.io.of(`/${location}`).fetchSockets()).map(socket => socket.id)
    }

    getAllOnlineUsers = async () => {
        let supportedLocations = getAllSupportedLocations()
        // key is location, value is list of users
        let usersMap = new Map<string, Array<string>>();
        await Promise.all(supportedLocations.map(async (location) => {
            let users = await this.getOnlineUsersOfLocation(location)
            usersMap.set(location, users)
        }))
        return usersMap;
    }
}

export default SocketHandler;

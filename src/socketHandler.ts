import { Server as IoServer, Socket } from "socket.io";
import * as http from "http";
import { instrument } from "@socket.io/admin-ui";
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from "./types/EventInterfaces";

export function startSocketServer(httpServer: http.Server) {
    // create server object
    const ioServer = new IoServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(httpServer, {
        cors: {
            origin: ["https://admin.socket.io", "http://quickdates.in", "http://localhost:3001"],
            credentials: true,
        },
    });

    instrument(ioServer, {
        auth: false,
    });

    startEventListenerForSocketServer(ioServer);
    return ioServer;
}

interface Message {
    message: string,
    sender: string
}

export let conversationList = new Array<Message>();

const startEventListenerForSocketServer = (ioServer: IoServer) => {
    ioServer.on("connection", async (socket) => {
        // connection event
        console.log(`A user connected with socketId: ${socket.id}`);
        console.log(`Total active sockets: ${await getActiveSocketsLength(ioServer)}`, "\n")

        socket.on('message', (msg: {message: string}) => {
            console.log(`${socket.id} : ${JSON.stringify(msg)}`)
            
            let event = {
                ...msg,
                sender: socket.id
            }
            conversationList = [...conversationList, event].slice(-10)

            ioServer.emit('conversationItem', event);
        })

        // disconnect event
        socket.on("disconnect", async () => {
            console.log(`A user disconnected with socketId: ${socket.id}`);
            console.log(`Total active sockets: ${await getActiveSocketsLength(ioServer)}`, "\n")
        });
    });
};

export const getAllRooms = (ioServer: IoServer): Array<string> => {
    return []
};

export const getAllSockets = async (ioServer: IoServer) => {
    return (await ioServer.fetchSockets()).map(socket => socket.id)
}

const getActiveSocketsLength = async (ioServer: IoServer) => {
    return (await getAllSockets(ioServer)).length
}

const addSocketToRoom = (roomName: string, socket: Socket) => {
    console.log(`Adding ${socket.id} to room: ${roomName}`);
    socket.join(roomName);
};

const removeSocketFromRoom = (roomName: string, socket: Socket) => {
    console.log(`removing ${socket.id} from room: ${roomName}`);
    socket.leave(roomName);
};

const sendPrivateMessage = () => {

}

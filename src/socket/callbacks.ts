import { Namespace, Server as IoServer, Socket } from "socket.io";
import { Message } from "../types/conversation";
import * as conversationManager from "../cache/conversationCache.js";
import { MAX_CONVERSATIONS_STORED_PER_CHANNEL as maxMessages } from "../constants/channelConstants.js";

export const groupMessageCallback = (
    message: Message,
    regionalNamespace: Namespace
) => {
    console.log(`New group message: ${message}`);
    conversationManager.storeMessageOfChannel(
        `${location}:${message.receiver}`,
        message,
        maxMessages
    );
    regionalNamespace.to(message.receiver).emit("groupMessage", message);
};

export const directMessageCallback = (
    message: Message,
    regionalNamespace: Namespace
) => {
    console.log("directMessage: ", message);
    regionalNamespace.to(message.receiver).emit("directMessage", message);
};

export const joinRoomCallback = async (
    location: string,
    roomName: string,
    socket: Socket,
    regionalNamespace: Namespace,
    getSocketsInChannel: (
        location: string,
        roomName: string
    ) => Promise<Array<string>>
) => {
    console.log(`joining ${socket.id} to room: ${roomName}`);
    // emit to the channel that new user has joined
    socket.join(roomName);
    regionalNamespace
        .to(roomName)
        .emit(
            "onlineUsersUpdate",
            roomName,
            await getSocketsInChannel(location, roomName)
        );
};

export const disconnectionCallback = async (
    socket: Socket,
    location: string,
    getSocketsInLocation: (location: string) => Promise<number>
) => {
    console.log(`A user disconnected with socketId: ${socket.id}`);
    console.log(`Connections left in ${location}: ${await getSocketsInLocation(location)}`);
};

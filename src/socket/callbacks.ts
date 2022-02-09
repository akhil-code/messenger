import SessionStore from '../datastore/sessionStore.js';
import { Namespace, Server as IoServer, Socket } from "socket.io";
import { Message } from "../types/conversation";
import * as conversationManager from "../cache/conversationCache.js";
import { MAX_CONVERSATIONS_STORED_PER_CHANNEL as maxMessages } from "../constants/channelConstants.js";
import MessageEvent from '../types/messageEvent.js';

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
    messageEvent: MessageEvent,
    regionalNamespace: Namespace
) => {
    console.log("directMessage: ", messageEvent);
    regionalNamespace.to(messageEvent.receiver.userId).emit("directMessage", messageEvent);
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

export const disconnectionCallback = async (socket: Socket, sessionStore: SessionStore) => {
    console.log(`A user disconnected with socketId: ${socket.id}`);
};
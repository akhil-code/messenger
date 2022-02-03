import { Message } from '../types/conversation'

/**
 * Key - location:channelId
 * Value - list of conversations with size limit of 10
 */
const cachedConversations: Map<string, Array<Message>> = new Map();

/**
 * Caches message added to a channel.
 * @param locationChannelId target location and channel id concatenated as location:channelId
 * @param message message to be cached.
 * @param maxConversationsStored max conversations stored for a channel.
 */
export function storeMessageOfChannel(locationChannelId: string, message: Message, maxConversationsStored: number): void {
    if(cachedConversations.has(locationChannelId)) {
        cachedConversations.set(locationChannelId, [...cachedConversations.get(locationChannelId), message].slice(-maxConversationsStored))
    } else {
        cachedConversations.set(locationChannelId, [message])
    }
    console.log(cachedConversations.get(locationChannelId))
}


/**
 * Returns list of stored conversations of the target channel.
 * @param locationChannelId target location and channel id concatenated as location:channelId
 */
export function getConversationOfChannel(locationChannelId: string): Array<Message> {
    if(cachedConversations.has(locationChannelId)) {
        return cachedConversations.get(locationChannelId)
    } else {
        return []
    }
}
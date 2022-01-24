import { Message } from '../types/Chat'

/**
 * Key - channelId
 * Value - list of conversations with size limit of 10
 */
const cachedConversations = new Map();

/**
 * Caches message added to a channel.
 * @param channelId target channel id.
 * @param message message to be cached.
 * @param maxConversationsStored max conversations stored for a channel.
 */
export function storeMessageOfChannel(channelId: string, message: Message, maxConversationsStored: number): void {
    if(cachedConversations.has(channelId)) {
        cachedConversations.set(channelId, [...cachedConversations.get(channelId), message].slice(-maxConversationsStored))
    } else {
        cachedConversations.set(channelId, [message])
    }
}


/**
 * Returns list of stored conversations of the target channel.
 */
export function getConversationOfChannel(channelId: string): Array<Message> {
    if(cachedConversations.has(channelId)) {
        return cachedConversations.get(channelId)
    } else {
        return []
    }
}
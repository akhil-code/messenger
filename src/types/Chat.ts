/**
 * @argument message - data being messaged
 * @argument sender - sender of message
 * @argument receiver receiver of message would be channelId in case of group messages.
 */
export interface Message {
    message: string,
    sender: string,
    receiver: string,
}
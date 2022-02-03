import { getAllSupportedLocations } from "./locationManager.js";


const SUPPORTED_CHANNELS_MAP: Map<string, Array<string>> = new Map();
getAllSupportedLocations().forEach(location => SUPPORTED_CHANNELS_MAP.set(location, ['Dating', 'Casual']))

export const getAllChannels = () => {
    return SUPPORTED_CHANNELS_MAP
}

export const addChannel = (newChannelName: string, location: string) => {
    if(SUPPORTED_CHANNELS_MAP.has(location)) {
        let existingChannels = SUPPORTED_CHANNELS_MAP.get(location);
        existingChannels.forEach(existingChannel => {
            if (existingChannel === newChannelName) {
                console.log(`${newChannelName} already exists in ${location}. Ignoring addChannel() request`)
                return;
            }
        })
        existingChannels.push(newChannelName)
        console.log(`successfully added ${newChannelName} to ${location}`)
    } else {
        SUPPORTED_CHANNELS_MAP.set(location, [newChannelName])
        console.log(`successfully added ${newChannelName} to ${location}`)
    }
}

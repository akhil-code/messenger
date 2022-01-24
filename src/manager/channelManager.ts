
const SUPPORTED_CHANNELS_MAP: Map<string, Array<string>> = new Map();

SUPPORTED_CHANNELS_MAP.set('Bangalore', ["Dating", "Casual", "Dating"])
SUPPORTED_CHANNELS_MAP.set('Mumbai', ["Dating"])
SUPPORTED_CHANNELS_MAP.set('Chennai', ["Dating"])

export const getAllChannels = () => {
    return SUPPORTED_CHANNELS_MAP
}

export const addChannel = (newChannelName: string, location: string) => {

    console.log(newChannelName, location)

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

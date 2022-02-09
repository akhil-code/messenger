import express, { application } from "express";
import * as http from "http";
import cors from "cors";
import  * as channelCache from './cache/conversationCache.js';
import SocketHandler from './socket/socketHandler.js';
import * as channelManager from './manager/channelManager.js'
import * as locationManager from './manager/locationManager.js';

const port: string | number = process.env.PORT || 3000;
const app = express();

// Enable CORS for all the requests.
app.use(cors())
app.use(express.json())

// http server is created out of express.
const httpServer = http.createServer(app);

// initiate socketIO server`
const socketHandler = new SocketHandler(httpServer);

app.get("/ping", (req, res) => {
    res.send("Healthy");
});

app.get("/chat-history", (req, res) => {
    let location = 'Bangalore'
    let channelId = 'Dating'
    res.send(channelCache.getConversationOfChannel(`${location}:${channelId}`))
});

app.get('/user/:userId', (req, res) => {
    let userId = req.params.userId
    res.send(socketHandler.getUser(userId))
})

app.get("/online-users", async (req, res) => {
    let usersMap = await socketHandler.getAllOnlineUsers()
    res.send(Object.fromEntries(usersMap))
});

app.get('/online-users/:location', async (req, res) => {
    let location = req.params.location;
    res.send(await socketHandler.getOnlineUsersOfLocation(location))
})

app.get("/online-users/:location/channel/:channelId", async (req, res) => {
    let channelId = req.params.channelId
    let location = req.params.location
    console.log(`fetching ${location} users in a channel: ${channelId}`)

    let response = await socketHandler.getSocketsInChannel(location, channelId)
    res.send(response)
})

app.post('/create-channel', (req, res) => {
    channelManager.addChannel(req.body.channelName, req.body.location);
    res.send(channelManager.getAllChannels())
})

app.get('/supported-channels', (req, res) => {
    let channels = channelManager.getAllChannels()
    res.send(Object.fromEntries(channels))
})

app.get('/supported-locations', (req, res) => {
    res.send(locationManager.getAllSupportedLocations());
})


// http server is set to listen to traffic.
httpServer.listen(port, () =>
    console.log(`application running on port: ${port}`)
);

import express from "express";
import * as http from "http";
import * as socketHandler from "./socketHandler.js";

const port : string|number = process.env.PORT || 6000;
const app = express();

// http server is created out of express.
const httpServer = http.createServer(app);

// web socket server
const ioServer = socketHandler.startSocketServer(httpServer);

app.get('/ping', (req, res) => {
    res.send("Healthy")
})

app.get("/sockets", async (req, res) => {
    res.send(await socketHandler.getAllSockets(ioServer))
})

// http server is set to listen to traffic.
httpServer.listen(port, () =>
    console.log(`application running on port: ${port}`)
);
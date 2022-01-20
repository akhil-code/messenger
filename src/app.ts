import express from "express";
import * as http from "http";
import * as socketHandler from "./socketHandler.js";
import cors from "cors";

const port: string | number = process.env.PORT || 3000;
const app = express();

// http server is created out of express.
const httpServer = http.createServer(app);

// web socket server
const ioServer = socketHandler.startSocketServer(httpServer);

app.get("/ping", (req, res) => {
    res.send("Healthy");
});

app.get("/chatHistory", cors(), (req, res) => {
    res.send(socketHandler.conversationList);
});

app.get("/sockets", cors(), async (req, res) => {
    res.send(await socketHandler.getAllSockets(ioServer));
});

// http server is set to listen to traffic.
httpServer.listen(port, () =>
    console.log(`application running on port: ${port}`)
);

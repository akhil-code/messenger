import express from "express"
import * as http from "http"
import path from "path"
import { createWebSocket } from "./socketHandler.js"

const port = 5000
const app = express()

// http server is created out of express.
const httpServer = http.createServer(app)
// web socket server
const ioServer = createWebSocket(httpServer)

const __dirname = path.resolve()
app.set('views', path.join(__dirname, 'build/views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'build/public')))

// web socket setup
ioServer.on("connection", socket => {
    console.log(`A user connected with socketId: ${socket.id}`)
    socket.on("chatMessage", msg => console.log(`message received: ${msg}`))
    // disconnect event
    socket.on('disconnect', () => `A user disconnected with socketId: ${socket.id}`)
})

// web server setup
app.get("/", (req, res) => {
    res.render('index')
})
// http server is set to listen to traffic.
httpServer.listen(port, () => console.log(`application running on port: ${port}`))
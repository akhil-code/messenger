let socket = io();

// add event listener for connect button
document.getElementById("connectButton").addEventListener("click", (event) => connectWebSocket());

/**
 * Updates web socket connection status.
 * @param {socket} socket 
 */
function displayConnectionStatus(socket) {
    // Set connection status
    document.getElementById("socketStatus").innerHTML = socket.connected
        ? `Connected. SocketID: ${socket.id}`
        : "Disconnected";
}

/**
 * Function to create a web socket connection
 */
function connectWebSocket() {
    // connect to web socket
    let socket = io();
    socket.on("connect", () => postConnectionSetup(socket));
    socket.on("disconnect", () =>
        setTimeout(displayConnectionStatus(socket), 1000)
    );
}

/**
 * Callback triggered post successful setup of socket connection.
 * @param {socket} socket 
 */
function postConnectionSetup(socket) {
    // update connection status
    setTimeout(displayConnectionStatus(socket), 1000);
    // add event listener for messaging
    addEventListenerForMessaging(socket);
}

/**
 * Adds event listener for send message button.
 * @param {socket}} socket 
 */
function addEventListenerForMessaging(socket) {
    let form = document.getElementById("form");
    let input = document.getElementById("input");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (input.value) {
            socket.emit("chatMessage", input.value);
            input.value = "";
        }
    });
}

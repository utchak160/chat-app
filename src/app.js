const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const PublicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(PublicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', 'Hey!, Welcome')
    socket.broadcast.emit('message', 'A new user joined');

    socket.on('messageSent', (message) => {
        io.emit('welcome', message);
    })

    socket.on('location', (location) => {
        io.emit('message',`https://google.com/maps?q=${location.latitude},${location.longitude}`);
    })

    socket.on('disconnect', () => {
        io.emit('welcome', 'A user has left');
    })
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});

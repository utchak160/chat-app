const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const PublicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(PublicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', generateMessage('Hey!, Welcome'));
    socket.broadcast.emit('message', generateMessage('A new user joined'));

    socket.on('messageSent', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        } else {
            io.emit('message', generateMessage(message));
            callback();
        }
    });

    socket.on('location', (location, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));

        callback();
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'));
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});

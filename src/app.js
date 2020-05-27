const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUsers, removeUser, getUser, getUserInRoom } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const PublicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(PublicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.on('join', (userData, callback) => {
        const { error, user } = addUsers({ id: socket.id, ...userData })

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Hey!, Welcome', 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback();

        //socket.emit(), io.emit(), socket.broadcast.emit()
        //io.to.emit(), socket.broadcast.to.emit()
    })

    socket.on('messageSent', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        } else {
            const user = getUser(socket.id);
            if (user) {
                io.to(user.room).emit('message', generateMessage(message, user.username));
            }
            callback();
        }
    });

    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`, user.username));
        }
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`, 'Admin'));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});

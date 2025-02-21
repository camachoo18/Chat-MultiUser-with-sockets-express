const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const { saveMessage, getAllMessages } = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

// Configuración de la sesión
const sessionMiddleware = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
});

app.use(sessionMiddleware);

app.get('/', (req, res) => {
    req.session.username = `User_${Math.floor(Math.random() * 1000)}`;
    res.sendFile(__dirname + '/index.html');
});

// Compartir la sesión de Express con Socket.IO
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));

io.on('connection', (socket) => {
    const username = socket.handshake.session.username;

    console.log(`${username} connected`);

    // Enviar todos los mensajes guardados al nuevo usuario
    getAllMessages((err, messages) => {
        if (err) {
            return console.error(err.message);
        }
        socket.emit('load messages', messages);
    });

    socket.on('disconnect', () => {
        console.log(`${username} disconnected`);
    });

    socket.on('chat message', (msg) => {
        saveMessage(username, msg, (err, savedMessage) => {
            if (err) {
                return console.error(err.message);
            }
            io.emit('chat message', { username, msg });
        });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
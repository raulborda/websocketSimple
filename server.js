const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/send-message', (req, res) => {
    const { message } = req.body;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
    res.send({ status: 'Mensaje enviado', message });
});

wss.on('connection', (ws) => {
    console.log('Cliente conectadoooo!');
    ws.on('mensaje', (message) => {
    });
    ws.on('close', () => {
        console.log('Cliente desconectado!!!');
    });
});

server.listen(3000, () => {
    console.log('Server en el puerto 3000');
});

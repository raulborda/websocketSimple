const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('Conectado al server');
});

ws.on('message', (data) => {
    console.log('Mensaje desde el server:', data.toString());
});

ws.on('close', () => {
    console.log('Desconectado!!');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

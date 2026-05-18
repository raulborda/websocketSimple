const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function broadcast(wss, data, exclude = null) {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

// Endpoint HTTP para enviar mensajes desde herramientas externas (ej: curl, Postman)
app.post('/send-message', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Campo "text" requerido' });

    broadcast(wss, { type: 'server', text });
    res.json({ status: 'Mensaje enviado', text, clients: wss.clients.size });
});

// Devuelve cuántos clientes hay conectados
app.get('/status', (req, res) => {
    res.json({ clients: wss.clients.size });
});

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Cliente conectado [${ip}] — total: ${wss.clients.size}`);

    broadcast(wss, { type: 'info', text: `Un cliente se unió (total: ${wss.clients.size})` }, ws);

    ws.on('message', (raw) => {
        const str = raw.toString();
        console.log('RAW:', str);
        let text;
        try {
            const parsed = JSON.parse(str);
            text = parsed.text ?? str;
        } catch {
            text = str;
        }

        console.log(`Mensaje recibido: ${text}`);
        broadcast(wss, { type: 'client', text }, ws);
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado — total: ${wss.clients.size}`);
        broadcast(wss, { type: 'info', text: `Un cliente se fue (total: ${wss.clients.size})` });
    });

    ws.on('error', (err) => {
        console.error('Error en WebSocket:', err.message);
    });
});

// Ping/pong heartbeat para detectar clientes caídos
const HEARTBEAT_INTERVAL = 30_000;
const heartbeat = setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
});

wss.on('close', () => clearInterval(heartbeat));

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});

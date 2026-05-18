const WebSocket = require('ws');
const readline  = require('readline');

const URL = process.env.WS_URL ?? 'ws://localhost:3000';

const ws = new WebSocket(URL);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

ws.on('open', () => {
    console.log(`Conectado a ${URL}`);
    console.log('Escribí un mensaje y presioná Enter para enviarlo. Ctrl+C para salir.\n');
    rl.prompt();
});

ws.on('message', (data) => {
    const { type, text } = JSON.parse(data);
    const prefix = type === 'info' ? '[info]' : '[otro]';
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${prefix} ${text}`);
    rl.prompt();
});

ws.on('close', () => {
    console.log('\nDesconectado del servidor.');
    rl.close();
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('Error de WebSocket:', err.message);
});

rl.on('line', (line) => {
    const text = line.trim();
    if (!text) { rl.prompt(); return; }
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }));
    }
    rl.prompt();
});

rl.on('close', () => ws.close());

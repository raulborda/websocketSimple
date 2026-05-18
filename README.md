# WebSocket Simple

Demo de comunicación en tiempo real con WebSockets. Múltiples clientes conectados reciben los mensajes al instante, sin necesidad de hacer polling.

## Stack

- **Node.js** + **Express 5**
- **ws** (WebSocket nativo, sin Socket.io)

## Instalación

```bash
npm install
```

## Uso

### Iniciar el servidor

```bash
npm start
```

El servidor queda escuchando en `http://localhost:3000`.

Para desarrollo con reinicio automático:

```bash
npm run dev
```

### Cliente web

Abrí `http://localhost:3000` en el browser. Podés abrir varias pestañas y los mensajes que escribas en una aparecen en todas las demás en tiempo real.

### Cliente de terminal

```bash
node client.js
```

Escribí mensajes y presioná Enter para enviarlos. Ctrl+C para salir.

Para conectarte a otro servidor:

```bash
WS_URL=ws://otro-host:3000 node client.js
```

### Enviar mensajes desde HTTP (Bruno / Postman / curl)

```
POST http://localhost:3000/send-message
Content-Type: application/json

{ "message": "Hola desde afuera" }
```

El servidor recibe el mensaje y lo distribuye a todos los clientes WebSocket conectados.

Con curl:

```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola desde curl"}'
```

### Ver clientes conectados

```
GET http://localhost:3000/status
```

Responde con la cantidad de clientes conectados en ese momento:

```json
{ "clients": 2 }
```

## Arquitectura

```
Browser / node client.js
        │
        │  WebSocket (ws://)
        ▼
┌───────────────────┐
│      server.js    │
│                   │
│  Express (HTTP)   │◄── POST /send-message (Bruno, curl, etc.)
│  WebSocket Server │
│                   │
│  broadcast a      │
│  todos los        │
│  clientes         │
└───────────────────┘
```

- Los clientes WS pueden **enviar y recibir** mensajes.
- Un `POST /send-message` también distribuye mensajes a todos los WS conectados.
- El servidor hace **ping/pong** cada 30s para detectar conexiones caídas.
- El cliente web se **reconecta automáticamente** si el servidor se reinicia.

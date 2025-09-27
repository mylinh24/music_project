import { WebSocketServer } from 'ws';

const clients = new Set();

export const initWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        clients.add(ws);

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            clients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clients.delete(ws);
        });
    });

    return wss;
};

export const broadcastToAdmins = (message) => {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN state
            client.send(data);
        }
    });
};

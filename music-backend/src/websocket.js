import { WebSocketServer } from 'ws';
import Redis from 'ioredis';

const clients = new Set();
let redisPublisher;
let redisSubscriber;

export const initWebSocket = async (server) => {
    const wss = new WebSocketServer({ server });

    // Initialize Redis publisher only (no subscriber to avoid loop)
    redisPublisher = new Redis({
        host: 'localhost',
        port: 6379
    });

    redisPublisher.on('error', (err) => console.error('Redis publisher error:', err));

    console.log('Redis publisher initialized in old backend');

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

    // Publish to Redis for shared notifications
    if (redisPublisher) {
        console.log('Publishing to Redis admin_notifications:', data); // Debug log
        redisPublisher.publish('admin_notifications', data).then(() => {
            console.log('Successfully published to Redis');
        }).catch((error) => {
            console.error('Error publishing to Redis:', error);
        });
    } else {
        console.log('Redis publisher not initialized');
    }
};

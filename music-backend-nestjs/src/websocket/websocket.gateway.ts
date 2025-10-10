import { WebSocketGateway as WSGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

@WSGateway({ cors: true })
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private clients = new Set<Socket>();
  private redisPublisher: Redis;
  private redisSubscriber: Redis;

  async onModuleInit() {
    console.log('onModuleInit called in WebSocketGateway'); // Debug log
    // Initialize Redis clients with ioredis
    this.redisPublisher = new Redis({
      host: 'localhost',
      port: 6379
    });

    this.redisSubscriber = new Redis({
      host: 'localhost',
      port: 6379
    });

    // Handle errors for both clients
    this.redisPublisher.on('error', (err) => console.error('Redis publisher error:', err));
    this.redisSubscriber.on('error', (err) => console.error('Redis subscriber error:', err));

    // Subscribe to shared notifications
    this.redisSubscriber.subscribe('admin_notifications', (err, count) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log(`Subscribed to ${count} channels`);
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
      console.log('Received Redis message on channel', channel, ':', message); // Debug log
      try {
        const data = JSON.parse(message);
        console.log('Parsed Redis data:', data); // Debug log
        this.broadcastToAdmins(data);
      } catch (error) {
        console.error('Error parsing Redis message:', error);
      }
    });

    console.log('Redis clients initialized in NestJS');
  }

  handleConnection(client: Socket) {
    console.log('New WebSocket connection:', client.id);
    this.clients.add(client);
  }

  handleDisconnect(client: Socket) {
    console.log('WebSocket connection closed:', client.id);
    this.clients.delete(client);
  }

  broadcastToAdmins(message: any) {
    const data = JSON.stringify(message);
    console.log('Broadcasting to WebSocket clients:', data); // Debug log
    this.clients.forEach((client) => {
      if (client.connected) {
        client.send(data);
      }
    });

    // Do not publish back to Redis to avoid infinite loop
    // The publish is handled by the source (e.g., old backend)
  }
}

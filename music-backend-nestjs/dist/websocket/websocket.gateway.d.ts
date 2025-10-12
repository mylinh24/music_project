import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
export declare class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    server: Server;
    private clients;
    private redisPublisher;
    private redisSubscriber;
    onModuleInit(): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastToAdmins(message: any): void;
}

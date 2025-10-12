"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
let WebSocketGateway = class WebSocketGateway {
    server;
    clients = new Set();
    redisPublisher;
    redisSubscriber;
    async onModuleInit() {
        console.log('onModuleInit called in WebSocketGateway');
        this.redisPublisher = new ioredis_1.default({
            host: 'localhost',
            port: 6379
        });
        this.redisSubscriber = new ioredis_1.default({
            host: 'localhost',
            port: 6379
        });
        this.redisPublisher.on('error', (err) => console.error('Redis publisher error:', err));
        this.redisSubscriber.on('error', (err) => console.error('Redis subscriber error:', err));
        this.redisSubscriber.subscribe('admin_notifications', (err, count) => {
            if (err) {
                console.error('Failed to subscribe:', err);
            }
            else {
                console.log(`Subscribed to ${count} channels`);
            }
        });
        this.redisSubscriber.on('message', (channel, message) => {
            console.log('Received Redis message on channel', channel, ':', message);
            try {
                const data = JSON.parse(message);
                console.log('Parsed Redis data:', data);
                this.broadcastToAdmins(data);
            }
            catch (error) {
                console.error('Error parsing Redis message:', error);
            }
        });
        console.log('Redis clients initialized in NestJS');
    }
    handleConnection(client) {
        console.log('New WebSocket connection:', client.id);
        this.clients.add(client);
    }
    handleDisconnect(client) {
        console.log('WebSocket connection closed:', client.id);
        this.clients.delete(client);
    }
    broadcastToAdmins(message) {
        const data = JSON.stringify(message);
        console.log('Broadcasting to WebSocket clients:', data);
        this.clients.forEach((client) => {
            if (client.connected) {
                client.send(data);
            }
        });
    }
};
exports.WebSocketGateway = WebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGateway.prototype, "server", void 0);
exports.WebSocketGateway = WebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true })
], WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map
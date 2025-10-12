import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { ListenHistory } from './entities/listen-history.entity';
export declare class AppController {
    private readonly appService;
    private listenHistoryRepository;
    constructor(appService: AppService, listenHistoryRepository: Repository<ListenHistory>);
    getHello(): string;
    recordListen(body: {
        song_id: number;
        user_id?: number;
    }): Promise<{
        message: string;
    }>;
}

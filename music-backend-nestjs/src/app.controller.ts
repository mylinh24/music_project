import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { ListenHistory } from './entities/listen-history.entity';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(ListenHistory)
    private listenHistoryRepository: Repository<ListenHistory>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('listen-history')
  async recordListen(@Body() body: { song_id: number; user_id?: number }) {
    const listenHistory = this.listenHistoryRepository.create({
      song_id: body.song_id,
      user_id: body.user_id,
    });
    await this.listenHistoryRepository.save(listenHistory);
    return { message: 'Listen recorded' };
  }
}

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raw } from 'typeorm';
import { AppService } from './app.service';
import { ListenHistory } from './entities/listen-history.entity';
import { Song } from './entities/song.entity';
import { Artist } from './entities/artist.entity';
import { Category } from './entities/category.entity';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(ListenHistory)
    private listenHistoryRepository: Repository<ListenHistory>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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

  @Get('songs/search')
  async getSongsBySearch(@Query() query: { q?: string; artist?: string; page?: string; limit?: string }) {
    const { q, artist, page = '1', limit = '20' } = query;
    const queryLimit = parseInt(limit) || 20;
    const offset = (parseInt(page) - 1) * queryLimit;

    const qb = this.songRepository.createQueryBuilder('song')
      .leftJoinAndSelect('song.artist', 'artist')
      .leftJoinAndSelect('song.category', 'category')
      .select([
        'song.id',
        'song.title',
        'song.audio_url',
        'song.image_url',
        'song.listenCount',
        'song.release_date',
        'song.exclusive',
        'artist.name',
        'category.name',
      ]);

    if (q) {
      qb.andWhere('LOWER(song.title) LIKE LOWER(:q)', { q: `%${q}%` });
    }

    if (artist) {
      qb.andWhere('LOWER(artist.name) LIKE LOWER(:artist)', { artist: `%${artist}%` });
    }

    qb.skip(offset).take(queryLimit);

    const songs = await qb.getMany();

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      audio_url: song.audio_url,
      image_url: song.image_url,
      listen_count: song.listenCount,
      release_date: song.release_date,
      exclusive: song.exclusive,
    }));

    return formattedSongs;
  }
}

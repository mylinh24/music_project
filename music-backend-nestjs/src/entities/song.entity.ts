import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Artist } from './artist.entity';
import { Category } from './category.entity';

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ nullable: true })
  artist_id: number;

  @Column({ nullable: true })
  category_id: number;

  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @Column({ name: 'listen_count', default: 0 })
  listenCount: number;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ length: 255, nullable: true })
  audio_url: string;

  @Column({ type: 'text', nullable: true })
  lyrics: string;

  @Column({ default: false })
  exclusive: boolean;

  @ManyToOne(() => Artist, { nullable: true })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

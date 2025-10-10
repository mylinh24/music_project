import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Song } from './song.entity';

@Entity('listen_history')
export class ListenHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  song_id: number;

  // ❗ Không để default, để tránh cập nhật lại dữ liệu cũ
  @Column({ name: 'listened_at', type: 'datetime', nullable: true })
  listenedAt: Date;

  // Quan hệ với User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Quan hệ với Song
  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'song_id' })
  song: Song;
}

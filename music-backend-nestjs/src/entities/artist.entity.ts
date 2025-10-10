import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  image_url: string;

  @Column({ name: 'total_listens', default: 0 })
  totalListens: number;
}

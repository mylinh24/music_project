import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vip_packages')
export class VipPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  duration: number; // in days
}

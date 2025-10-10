import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { VipPackage } from './vip-package.entity';

@Entity('vip_purchases')
export class VipPurchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  user_id: number;

  @Column({ name: 'payment_date', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: false })
  expiry_date: Date;

  @Column({ type: 'int', nullable: false })
  amount: number;

  @Column({ name: 'points_used', type: 'int', nullable: false, default: 0 })
  points_used: number;

  @Column({ name: 'vippackage_id', type: 'int', nullable: false })
  vippackage_id: number;

  @ManyToOne(() => VipPackage)
  @JoinColumn({ name: 'vippackage_id' })
  vipPackage: VipPackage;
}

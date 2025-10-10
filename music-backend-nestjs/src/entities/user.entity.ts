import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // tên bảng trong MySQL
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', name: 'firstName', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', name: 'lastName', nullable: true })
  lastName: string;

  @Column({ type: 'tinyint', name: 'isVerified', width: 1, default: 0 })
  isVerified: boolean;

  @Column({ type: 'longblob', nullable: true })
  avatar: Buffer;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  vip: boolean;

  @Column({ type: 'int', name: 'contribution_points', default: 0 })
  contributionPoints: number;

  @Column({ type: 'varchar', name: 'referral_code', nullable: true })
  referralCode: string;

  @Column({ type: 'int', name: 'referred_by', nullable: true })
  referredBy: number;

  @Column({ type: 'int', name: 'referral_count', default: 0 })
  referralCount: number;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: 'user' | 'admin';

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

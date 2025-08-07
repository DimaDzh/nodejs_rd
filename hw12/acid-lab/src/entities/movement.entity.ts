import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Account, (a) => a.outgoing, { nullable: false })
  from!: Account;

  @ManyToOne(() => Account, (a) => a.incoming, { nullable: false })
  to!: Account;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Check,
} from 'typeorm';
import { Movement } from './movement.entity';

@Entity('accounts')
@Check(`"balance" >= 0`)
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance!: number;

  @OneToMany(() => Movement, (movement) => movement.from)
  outgoing: Movement[];

  @OneToMany(() => Movement, (movement) => movement.to)
  incoming!: Movement[];
}

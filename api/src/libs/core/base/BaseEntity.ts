import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // timestamptz so times are stored in UTC and serialise with a "Z".
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Millisecond precision (Postgres defaults to microseconds): the queue's cursor
  // carries updatedAt through JavaScript, whose Date only holds milliseconds.
  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  updatedAt: Date;

  @Exclude()
  @VersionColumn({ default: 0 })
  version: number;
}

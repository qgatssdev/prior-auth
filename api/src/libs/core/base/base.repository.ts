import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(protected readonly entity: Repository<T>) {}

  create(data: DeepPartial<T>): T {
    return this.entity.create(data);
  }

  async save(data: DeepPartial<T>): Promise<T> {
    return this.entity.save(data);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.entity.findOne(options);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.entity.find(options);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.entity.count(options);
  }

  createQueryBuilder(alias: string) {
    return this.entity.createQueryBuilder(alias);
  }
}

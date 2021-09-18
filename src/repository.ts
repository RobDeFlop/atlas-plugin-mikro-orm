import { MikroService } from './services/mikro.service';
import { app } from '@abstractflo/atlas-shared';
import { EntityRepository } from '@mikro-orm/core';

export class Repository<T> {
  constructor(public entityType: new (...args: any[]) => T) {}

  protected get repository(): EntityRepository<T> {
    const mikroService = app.resolve(MikroService);
    return mikroService.entityManager.getRepository(this.entityType);
  }
}


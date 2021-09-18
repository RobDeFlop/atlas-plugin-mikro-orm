import { MikroService } from './services/mikro.service';
import { app } from '@abstractflo/atlas-shared';
import { EntityRepository } from '@mikro-orm/core';

export abstract class Repository<T> {
  protected entityType: new (...args: any[]) => T;

  protected get repository(): EntityRepository<T> {
    const mikroService = app.resolve(MikroService);
    return mikroService.entityManager.getRepository(this.entityType);
  }
}

import { MikroService } from './services/mikro.service';
import { app } from '@abstractflo/atlas-shared';
import { AnyEntity, EntityRepository } from '@mikro-orm/core';

export abstract class Repository<T> {
  protected entityType: new (...args: any[]) => T;

  protected repository(): EntityRepository<AnyEntity<unknown>> {
    const mikroService: MikroService = app.resolve(MikroService);
    return mikroService.entityManager.getRepository(typeof this.entityType);
  }
}

import { MikroOrmService } from './services/mikro-orm.service';
import { app } from '@abstractflo/atlas-shared';

export abstract class Repository<T> {
  protected entityType: new (...args: any[]) => T;

  protected get repository(): Repository<T> {
    const mikroService = app.resolve(MikroOrmService);
    return mikroService.entityManager.getRepository(this.entityType);
  }

}

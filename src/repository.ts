import { MikroService } from './services/mikro.service';
import { app } from '@abstractflo/atlas-shared';

export abstract class Repository<T> {
  protected entityType: new (...args: any[]) => T;

  protected get repository(): Repository<T> {
    const mikroService = app.resolve(MikroService);
    return mikroService.entityManager.getRepository(this.entityType);
  }
}

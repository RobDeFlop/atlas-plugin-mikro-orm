import { constructor, getFrameworkMetaData, Init, Singleton, UtilsService } from '@abstractflo/atlas-shared';
import { EntityManager, MikroORM, Options } from '@mikro-orm/core';
import { Symbols } from '../symbols';

@Singleton
export class MikroService {

  public entityManager: EntityManager;
  private databaseConnection: MikroORM;
  private isConnected: boolean = false;

  @Init(-1)
  public async initConnection(): Promise<void> {
    if (this.isConnected) return;
    const config = this.generateConfig();

    try {
      this.databaseConnection = await MikroORM.init(config);
      this.isConnected = true;
    } catch (err) {
      UtilsService.logError('Failed to connect to database', err);
      throw err;
    }

    UtilsService.logRegisteredHandlers('MikroORMService', config.entities.length);
    UtilsService.logLoaded('MikroORMService');

    this.entityManager = this.databaseConnection.em;
  }

  /**
   * Generates a config from .env variables
   * @returns {Options}
   * @private
   */
  private generateConfig(): Options {
    const databaseEntities = getFrameworkMetaData<constructor<any>[]>(Symbols.MIKRO_ENTITIES, this);
    const registeredEntities = [];

    if (databaseEntities.length) {
      registeredEntities.push(...databaseEntities);
    }

    return {
      dbName: process.env.DB_NAME,
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_USER,
      entities: registeredEntities,
      debug: process.env.NODE_ENV === 'development'
    } as Options;
  }

}

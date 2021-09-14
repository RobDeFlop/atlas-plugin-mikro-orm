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
      await this.setupDatabase(config);
    } catch (err) {
      UtilsService.logError('Failed to connect to database', err);
      throw err;
    }

    UtilsService.logRegisteredHandlers('MikroORMService', config.entities.length);
    UtilsService.logLoaded('MikroORMService');

    this.entityManager = this.databaseConnection.em;
    this.isConnected = true;
  }

  /**
   * Connects to database and does a migration
   * @param {Options} config
   * @returns {Promise<void>}
   * @private
   */
  private async setupDatabase(config: Options): Promise<void> {
    this.databaseConnection = await MikroORM.init(config);
    await this.databaseConnection.getMigrator().up;
    await this.databaseConnection.getSchemaGenerator().updateSchema();
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
      password: process.env.DB_PASSWORD,
      entities: registeredEntities,
      debug: process.env.DB_DEBUG === 'true'
    } as Options;
  }

}

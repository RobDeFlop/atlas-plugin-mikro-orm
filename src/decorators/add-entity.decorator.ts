import { app, constructor, getFrameworkMetaData, Injectable } from '@abstractflo/atlas-shared';
import { MikroOrmService } from '../services/mikro-orm.service';
import { Symbols } from '../symbols';

/**
 * Decorator to register entities automatically
 * @param {constructor<any>} target
 * @constructor
 */
export function AddEntity(target: constructor<any>): void{
  const mikroService = app.resolve(MikroOrmService);
  const databaseEntities = getFrameworkMetaData<constructor<any>[]>(Symbols.MIKRO_ENTITIES, mikroService);
  const doesEntityExists = databaseEntities.find((entity: constructor<any>) => entity === target)

  if(doesEntityExists) return;

  Injectable(target);

  databaseEntities.push(target);
  Reflect.defineMetadata<constructor<any>[]>(Symbols.MIKRO_ENTITIES,databaseEntities, mikroService)
}

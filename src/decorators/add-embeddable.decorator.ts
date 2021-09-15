import { app, constructor, getFrameworkMetaData, Injectable } from '@abstractflo/atlas-shared';
import { MikroService } from '../services/mikro.service';
import { Symbols } from '../symbols';
import { Embeddable } from '@mikro-orm/core';

/**
 * Decorator to register embeddables automatically
 * @constructor
 * @param target
 */
export function AddEmbeddable(target: constructor<any>): void {

  const mikroService = app.resolve(MikroService);
  const databaseEntities = getFrameworkMetaData<constructor<any>[]>(Symbols.MIKRO_ENTITIES, mikroService);
  const doesEntityExists = databaseEntities.find((entity: constructor<any>) => entity === target);

  if (doesEntityExists) return;

  Injectable(target);
  Embeddable()(target);
  databaseEntities.push(target);
  Reflect.defineMetadata<constructor<any>[]>(Symbols.MIKRO_ENTITIES, databaseEntities, mikroService);
}

import { app, constructor, getFrameworkMetaData, Injectable } from '@abstractflo/atlas-shared';
import { MikroService } from '../services/mikro.service';
import { Symbols } from '../symbols';
import { Entity, EntityOptions } from '@mikro-orm/core';

/**
 * Decorator to register entities automatically
 * @constructor
 * @param options
 */
export function AddEntity(options?: EntityOptions<any>): (target: constructor<any>) => void {
  return function(target: constructor<any>){
    const mikroService = app.resolve(MikroService);
    const databaseEntities = getFrameworkMetaData<constructor<any>[]>(Symbols.MIKRO_ENTITIES, mikroService);
    const doesEntityExists = databaseEntities.find((entity: constructor<any>) => entity === target);

    if (doesEntityExists) return false;

    Injectable(target);
    Entity(options)(target);
    databaseEntities.push(target);
    Reflect.defineMetadata<constructor<any>[]>(Symbols.MIKRO_ENTITIES, databaseEntities, mikroService);

    return target;
  }

}


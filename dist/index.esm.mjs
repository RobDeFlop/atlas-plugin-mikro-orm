import { __decorate, __metadata } from 'tslib';
import { UtilsService, getFrameworkMetaData, Init, Singleton, app, Injectable } from '@abstractflo/atlas-shared';
import { MikroORM, Entity, Embeddable } from '@mikro-orm/core';
export * from '@mikro-orm/core';

const Symbols = {
    MIKRO_ENTITIES: Symbol("MIKRO_ENTITIES")
};

let MikroService = class MikroService {
    entityManager;
    databaseConnection;
    isConnected = false;
    async initConnection() {
        if (this.isConnected)
            return;
        const config = this.generateConfig();
        await this.setupDatabase(config);
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
    async setupDatabase(config) {
        try {
            this.databaseConnection = await MikroORM.init(config);
            await this.databaseConnection.getMigrator().up;
            await this.databaseConnection.getSchemaGenerator().updateSchema();
        }
        catch (e) {
            UtilsService.logError(e);
            throw e;
        }
    }
    /**
     * Generates a config from .env variables
     * @returns {Options}
     * @private
     */
    generateConfig() {
        const databaseEntities = getFrameworkMetaData(Symbols.MIKRO_ENTITIES, this);
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
        };
    }
};
__decorate([
    Init(-1),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MikroService.prototype, "initConnection", null);
MikroService = __decorate([
    Singleton
], MikroService);

/**
 * Decorator to register entities automatically
 * @constructor
 * @param options
 */
function AddEntity(options) {
    return function (target) {
        const mikroService = app.resolve(MikroService);
        const databaseEntities = getFrameworkMetaData(Symbols.MIKRO_ENTITIES, mikroService);
        const doesEntityExists = databaseEntities.find((entity) => entity === target);
        if (doesEntityExists)
            return false;
        Injectable(target);
        Entity(options)(target);
        databaseEntities.push(target);
        Reflect.defineMetadata(Symbols.MIKRO_ENTITIES, databaseEntities, mikroService);
        return target;
    };
}

/**
 * Decorator to register embeddables automatically
 * @constructor
 * @param target
 */
function AddEmbeddable(target) {
    const mikroService = app.resolve(MikroService);
    const databaseEntities = getFrameworkMetaData(Symbols.MIKRO_ENTITIES, mikroService);
    const doesEntityExists = databaseEntities.find((entity) => entity === target);
    if (doesEntityExists)
        return;
    Injectable(target);
    Embeddable()(target);
    databaseEntities.push(target);
    Reflect.defineMetadata(Symbols.MIKRO_ENTITIES, databaseEntities, mikroService);
}

class Repository {
    entityType;
    constructor(entityType) {
        this.entityType = entityType;
    }
    get repository() {
        const mikroService = app.resolve(MikroService);
        return mikroService.entityManager.getRepository(this.entityType);
    }
}

export { AddEmbeddable, AddEntity, MikroService, Repository };

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var atlasShared = require('@abstractflo/atlas-shared');
var core = require('@mikro-orm/core');

const Symbols = {
    MIKRO_ENTITIES: Symbol("MIKRO_ENTITIES")
};

exports.MikroService = class MikroService {
    entityManager;
    databaseConnection;
    isConnected = false;
    async initConnection() {
        if (this.isConnected)
            return;
        const config = this.generateConfig();
        await this.setupDatabase(config);
        atlasShared.UtilsService.logRegisteredHandlers('MikroORMService', config.entities.length);
        atlasShared.UtilsService.logLoaded('MikroORMService');
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
            this.databaseConnection = await core.MikroORM.init(config);
            await this.databaseConnection.getMigrator().up;
            await this.databaseConnection.getSchemaGenerator().updateSchema();
        }
        catch (e) {
            atlasShared.UtilsService.logError(e);
            throw e;
        }
    }
    /**
     * Generates a config from .env variables
     * @returns {Options}
     * @private
     */
    generateConfig() {
        const databaseEntities = atlasShared.getFrameworkMetaData(Symbols.MIKRO_ENTITIES, this);
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
tslib.__decorate([
    atlasShared.Init(-1),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", []),
    tslib.__metadata("design:returntype", Promise)
], exports.MikroService.prototype, "initConnection", null);
exports.MikroService = tslib.__decorate([
    atlasShared.Singleton
], exports.MikroService);

/**
 * Decorator to register entities automatically
 * @constructor
 * @param options
 */
function AddEntity(options) {
    return function (target) {
        const mikroService = atlasShared.app.resolve(exports.MikroService);
        const databaseEntities = atlasShared.getFrameworkMetaData(Symbols.MIKRO_ENTITIES, mikroService);
        const doesEntityExists = databaseEntities.find((entity) => entity === target);
        if (doesEntityExists)
            return false;
        atlasShared.Injectable(target);
        core.Entity(options)(target);
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
    const mikroService = atlasShared.app.resolve(exports.MikroService);
    const databaseEntities = atlasShared.getFrameworkMetaData(Symbols.MIKRO_ENTITIES, mikroService);
    const doesEntityExists = databaseEntities.find((entity) => entity === target);
    if (doesEntityExists)
        return;
    atlasShared.Injectable(target);
    core.Embeddable()(target);
    databaseEntities.push(target);
    Reflect.defineMetadata(Symbols.MIKRO_ENTITIES, databaseEntities, mikroService);
}

class Repository {
    entityType;
    constructor(entityType) {
        this.entityType = entityType;
    }
    get repository() {
        const mikroService = atlasShared.app.resolve(exports.MikroService);
        return mikroService.entityManager.getRepository(this.entityType);
    }
}

exports.AddEmbeddable = AddEmbeddable;
exports.AddEntity = AddEntity;
exports.Repository = Repository;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return core[k];
    }
  });
});

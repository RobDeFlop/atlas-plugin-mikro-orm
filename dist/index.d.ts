import { constructor } from '@abstractflo/atlas-shared';
import { EntityManager } from '@mikro-orm/core';
import { EntityOptions } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/core';

/**
 * Decorator to register embeddables automatically
 * @constructor
 * @param target
 */
export declare function AddEmbeddable(target: constructor<any>): void;

/**
 * Decorator to register entities automatically
 * @constructor
 * @param options
 */
export declare function AddEntity(options?: EntityOptions<any>): (target: constructor<any>) => void;

export declare class MikroService {
    entityManager: EntityManager;
    private databaseConnection;
    private isConnected;
    initConnection(): Promise<void>;
    /**
     * Connects to database and does a migration
     * @param {Options} config
     * @returns {Promise<void>}
     * @private
     */
    private setupDatabase;
    /**
     * Generates a config from .env variables
     * @returns {Options}
     * @private
     */
    private generateConfig;
}

export declare abstract class Repository<T> {
    protected entityType: new (...args: any[]) => T;
    protected get repository(): EntityRepository<T>;
}


export * from "@mikro-orm/core";

export { }

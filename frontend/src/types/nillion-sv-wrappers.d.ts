declare module 'nillion-sv-wrappers' {
  export interface SecretVaultConfig {
    nodes: any[];
    orgCredentials: any;
  }

  export class SecretVaultWrapper {
    constructor(config: SecretVaultConfig);
    init(): Promise<void>;
    createSchema(schema: any, name: string): Promise<any[]>;
    getCollection(name: string): Collection;
  }

  export class Collection {
    constructor(name: string, config: any);
    find(query?: any): Promise<any[]>;
    findOne(query: any): Promise<any>;
    insert(data: any): Promise<any>;
    update(query: any, data: any): Promise<any>;
    delete(query: any): Promise<void>;
  }
}

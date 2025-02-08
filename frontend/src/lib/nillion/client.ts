import { SecretVaultWrapper, Collection } from 'nillion-sv-wrappers';
import { orgConfig } from './config';
import { SCHEMA_IDS } from './constants';

class NillionClient {
  private static instance: NillionClient;
  private client: SecretVaultWrapper | null = null;
  private initialized = false;
  private initializing = false;

  private constructor() {}

  private async getCollection(schemaId: string): Promise<SecretVaultWrapper> {
    const client = await this.getClient();
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      schemaId
    );
    await collection.init();
    return collection;
  }

  static getInstance(): NillionClient {
    if (!NillionClient.instance) {
      NillionClient.instance = new NillionClient();
    }
    return NillionClient.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) {
      return;
    }

    try {
      this.initializing = true;
      console.log('[NillionClient] Initializing...');
      
      // Create a new instance with nodes and credentials
      this.client = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials
      );
      
      // Initialize the client
      await this.client.init();
      
      this.initialized = true;
      console.log('[NillionClient] Initialized successfully');
    } catch (error) {
      console.error('[NillionClient] Initialization failed:', error);
      this.initialized = false;
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  async getClient(): Promise<SecretVaultWrapper> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.client) {
      throw new Error('Nillion client not initialized');
    }
    
    return this.client;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const nillionClient = NillionClient.getInstance();

import { SecretVaultWrapper, Collection } from 'nillion-sv-wrappers';
import { orgConfig } from './config';
import { SCHEMA_IDS } from './constants';

export interface Bounty {
  title: string;
  owner: string;
  requiredSkills: string;
  datePosted: string;
  dueDate: string;
  state: string;
  estimatedTime: string;
  description: string;
  longDescription: string;
  bountyId: string;
  reward: {
    amount: string;
    token: string;
    chainId: string;
  };
}

class NillionClient {
  private static instance: NillionClient;
  private client: SecretVaultWrapper | null = null;
  private initialized = false;
  private initializing = false;

  private constructor() {}

  async initializeSchema(): Promise<string> {
    try {
      console.log('[NillionClient] Initializing schema...');
      const org = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials
      );
      await org.init();

      // Create a new collection schema for all nodes in the org
      const collectionName = 'Bounty Schema';
      const schema = await import('./schema.json');
      console.log('[NillionClient] Creating schema with:', schema);
      const newSchema = await org.createSchema(schema, collectionName);
      const schemaId = newSchema[0].result.data;
      console.log('[NillionClient] Schema created with ID:', schemaId);
      return schemaId;
    } catch (error) {
      console.error('[NillionClient] Error initializing schema:', error);
      throw error;
    }
  }

  async getCollection(schemaId: string): Promise<SecretVaultWrapper> {
    try {
      console.log('[NillionClient] Creating collection with:', {
        nodes: orgConfig.nodes,
        credentials: orgConfig.orgCredentials,
        schemaId
      });

      // Create a secret vault wrapper and initialize the SecretVault collection to use
      const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        schemaId
      );

      console.log('[NillionClient] Collection created, initializing...');
      await collection.init();
      console.log('[NillionClient] Collection initialized');

      return collection;
    } catch (error) {
      console.error('[NillionClient] Error in getCollection:', error);
      throw error;
    }
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

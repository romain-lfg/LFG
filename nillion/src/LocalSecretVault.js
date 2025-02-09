import { SecretVaultWrapper } from 'nillion-sv-wrappers';
/**
 * LocalSecretVault extends SecretVaultWrapper to provide local secret vault functionality.
 * Inherits all functionality from SecretVaultWrapper while allowing for local-specific
 * customizations and extensions.
 *
 * @example
 * const localVault = new LocalSecretVault(nodes, credentials, schemaId);
 * await localVault.init();
 * await localVault.writeToNodes(data);
 */
export class LocalSecretVault extends SecretVaultWrapper {
  constructor(nodes, credentials, schemaId = null, operation = 'store', tokenExpirySeconds = 3600) {
    super(nodes, credentials, schemaId, operation, tokenExpirySeconds);
  }

  async updateDataToNodes(recordUpdate, filter = {}) {
    const results = [];

    const transformedData = await this.allotData([recordUpdate]);
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      try {
        const [nodeData] = transformedData.map((encryptedShares) => {
          if (encryptedShares.length !== this.nodes.length) {
            return encryptedShares[0];
          }
          return encryptedShares[i];
        });
        const jwt = await this.generateNodeToken(node.did);
        const payload = {
          schema: this.schemaId,
          update: {
            $set: nodeData,
          },
          filter,
        };
        const result = await this.makeRequest(
          node.url,
          'data/update',
          jwt,
          payload
        );
        results.push({ node: node.url, result });
      } catch (error) {
        console.error(`❌ Failed to write to ${node.url}:`, error.message);
        results.push({ node: node.url, error: error.message });
      }
    }
    return results;
  }
}
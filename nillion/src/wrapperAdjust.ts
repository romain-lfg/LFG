// async updateDataToNodes(recordUpdate, filter = {}) {
//     const results = [];

//     const transformedData = await this.allotData([recordUpdate]);
//     for (let i = 0; i < this.nodes.length; i++) {
//       const node = this.nodes[i];
//       try {
//         const [nodeData] = transformedData.map((encryptedShares) => {
//           if (encryptedShares.length !== this.nodes.length) {
//             return encryptedShares[0];
//           }
//           return encryptedShares[i];
//         });
//         const jwt = await this.generateNodeToken(node.did);
//         const payload = {
//           schema: this.schemaId,
//           update: {
//             $set: nodeData,
//           },
//           filter,
//         };
//         const result = await this.makeRequest(
//           node.url,
//           'data/update',
//           jwt,
//           payload
//         );
//         results.push({ node: node.url, result });
//       } catch (error) {
//         console.error(`❌ Failed to write to ${node.url}:`, error.message);
//         results.push({ node: node.url, error: error.message });
//       }
//     }
//     return results;
//   }
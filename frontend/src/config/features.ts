/**
 * Feature flags configuration
 * Used to enable/disable features in different environments
 */

export const features = {
  // Bounty features
  bounties: {
    create: true,
  },
};

// Helper type for feature paths
type FeaturePath = keyof typeof features | `${keyof typeof features}.${string}`;

// Check if a feature is enabled
// @param path Dot notation path to feature flag (e.g., 'bounties.create')
// @returns boolean indicating if feature is enabled
export function isFeatureEnabled(path: FeaturePath): boolean {
  const parts = path.split('.');
  let current: any = features;
  
  for (const part of parts) {
    if (current[part] === undefined) return false;
    current = current[part];
  }
  
  return !!current;
}

/**
 * Feature flags configuration
 * Used to enable/disable features in different environments
 */

export const features = {
  nillion: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_NILLION === 'true',
  },
  // Authentication features
  auth: {
    enabled: false,
    mockUser: true,
  },
  
  // Bounty features
  bounties: {
    create: true,
    apply: false,
    filter: false,
    sort: false,
    search: false,
  },
  
  // Smart contract features
  contracts: {
    enabled: false,
    mockTransactions: true,
  },
  
  // Agent features
  agent: {
    enabled: false,
    mockResponses: true,
  },
  
  // Profile features
  profile: {
    edit: false,
    history: false,
    analytics: false,
  }
} as const;

// Helper type for feature paths
type FeaturePath = string;

/**
 * Check if a feature is enabled
 * @param path Dot notation path to feature flag (e.g., 'auth.enabled')
 * @returns boolean indicating if feature is enabled
 */
export function isFeatureEnabled(path: FeaturePath): boolean {
  return path.split('.').reduce((obj, key) => obj?.[key], features as any) ?? false;
}

/**
 * Get all enabled features
 * @returns Record of enabled feature paths
 */
export function getEnabledFeatures(): Record<string, boolean> {
  const enabled: Record<string, boolean> = {};
  
  function traverse(obj: any, path: string[] = []) {
    for (const key in obj) {
      const newPath = [...path, key];
      if (typeof obj[key] === 'boolean') {
        enabled[newPath.join('.')] = obj[key];
      } else if (typeof obj[key] === 'object') {
        traverse(obj[key], newPath);
      }
    }
  }
  
  traverse(features);
  return enabled;
}

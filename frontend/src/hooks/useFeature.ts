import { isFeatureEnabled } from '@/config/features';

/**
 * Hook to check if a feature is enabled
 * @param featurePath Dot notation path to feature flag
 * @returns boolean indicating if feature is enabled
 */
export function useFeature(featurePath: string): boolean {
  return isFeatureEnabled(featurePath);
}

/**
 * Hook to render content only if a feature is enabled
 * @param featurePath Dot notation path to feature flag
 * @param children Content to render if feature is enabled
 * @param fallback Optional fallback content if feature is disabled
 * @returns React element or null
 */
export function FeatureGate({ 
  featurePath, 
  children, 
  fallback = null 
}: { 
  featurePath: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement | null {
  const isEnabled = useFeature(featurePath);
  
  if (!isEnabled) {
    return fallback as React.ReactElement | null;
  }
  
  return children as React.ReactElement;
}

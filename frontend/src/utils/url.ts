/**
 * Utility functions for URL handling
 */

/**
 * Ensures a URL is properly formatted as an absolute URL
 * This prevents issues where relative URLs might be incorrectly appended to the frontend URL
 * 
 * @param url The URL to format
 * @returns A properly formatted absolute URL
 */
export function ensureAbsoluteUrl(url: string): string {
  // If the URL already starts with http:// or https://, it's already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get the API URL from environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Log the API URL for debugging
  console.log('API URL from environment:', apiUrl);
  
  // If API URL is not set, use a default or throw an error
  if (!apiUrl) {
    console.error('NEXT_PUBLIC_API_URL environment variable is not set');
    // Fallback to relative URL as a last resort
    return url;
  }
  
  // Remove trailing slash from API URL if it exists
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  // If the URL starts with a slash, it's a relative URL - we need to prepend the API URL
  if (url.startsWith('/')) {
    const fullUrl = `${baseUrl}${url}`;
    console.log('Constructed full URL:', fullUrl);
    return fullUrl;
  }
  
  // If it doesn't start with a slash, assume it's a relative URL and add a slash
  const fullUrl = `${baseUrl}/${url}`;
  console.log('Constructed full URL:', fullUrl);
  return fullUrl;
}

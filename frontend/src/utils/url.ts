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
    console.log('URL is already absolute:', url);
    return url;
  }
  
  // Get the API URL from environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  console.log('API URL from environment:', apiUrl);
  
  if (!apiUrl) {
    console.error('NEXT_PUBLIC_API_URL environment variable is not set');
    // Fallback to a relative URL as a last resort
    return url;
  }
  
  // Ensure the API URL has a protocol
  let normalizedApiUrl = apiUrl;
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    normalizedApiUrl = `https://${apiUrl}`;
    console.log('Added https:// protocol to API URL:', normalizedApiUrl);
  }
  
  // Parse the API URL to ensure it's valid
  let baseUrl: string;
  try {
    // Create a URL object to validate and normalize the API URL
    const parsedUrl = new URL(normalizedApiUrl);
    baseUrl = parsedUrl.origin;
    console.log('Parsed API base URL:', baseUrl);
  } catch (error) {
    console.error('Invalid API URL format:', normalizedApiUrl, error);
    // Fallback to using the raw API URL as a string
    baseUrl = normalizedApiUrl.endsWith('/') ? normalizedApiUrl.slice(0, -1) : normalizedApiUrl;
    console.log('Falling back to string manipulation for API URL:', baseUrl);
  }
  
  // Ensure the path part of the URL starts with a slash
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // Construct the full URL
  const fullUrl = `${baseUrl}${path}`;
  console.log('Constructed full URL:', fullUrl);
  
  return fullUrl;
}

// Small helper to normalize the API base URL so we never end up with
// double-slashes when concatenating endpoints.
export function normalizedApiBase(apiUrl: string): string {
  if (!apiUrl) return apiUrl;
  // Remove trailing slashes
    return apiUrl.replace(/\/+$/g, '');
}

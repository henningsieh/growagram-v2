// Helper function to convert URLSearchParams to a plain object
// Handles potential multiple values for the same key
export function searchParamsToObject(
  params: URLSearchParams,
): Record<string, string | string[]> {
  const obj: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    const existing = obj[key];
    if (existing === undefined) {
      // If key doesn't exist, add it as a string
      obj[key] = value;
    } else if (Array.isArray(existing)) {
      // If key exists and is an array, push the new value
      existing.push(value);
    } else {
      // If key exists and is a string, convert it to an array and add the new value
      obj[key] = [existing, value];
    }
  });
  return obj;
}

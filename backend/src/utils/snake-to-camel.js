/**
 * Utility function to convert snake_case to camelCase
 * Used for converting database column names
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Quote a camelCase identifier for PostgreSQL
 */
export function quoteIdentifier(str) {
  return `"${str}"`;
}

/**
 * Convert snake_case column name to quoted camelCase
 */
export function convertColumnName(snakeCase) {
  const camelCase = snakeToCamel(snakeCase);
  return quoteIdentifier(camelCase);
}


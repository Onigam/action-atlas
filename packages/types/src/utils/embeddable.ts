import { z } from 'zod';

/**
 * Symbol used to store embeddable metadata on Zod schemas.
 * This allows us to mark fields that should be included in vector embeddings.
 */
export const EMBEDDABLE_KEY = Symbol('embeddable');

/**
 * Symbol used to store the embedding path/key name for nested objects.
 * This helps identify the field name when extracting embeddable values.
 */
export const EMBEDDABLE_PATH_KEY = Symbol('embeddablePath');

/**
 * Metadata stored on embeddable schemas
 */
export interface EmbeddableMetadata {
  embeddable: true;
  path?: string;
}

/**
 * Type helper for schemas that have been marked as embeddable
 */
export type EmbeddableSchema<T extends z.ZodTypeAny> = T & {
  [EMBEDDABLE_KEY]: EmbeddableMetadata;
};

/**
 * Marks a Zod schema as embeddable for vector search.
 * The resulting values will be included when generating embeddings.
 *
 * @example
 * const ActivitySchema = z.object({
 *   title: embeddable(z.string()),           // Will be included in embeddings
 *   description: embeddable(z.string()),     // Will be included in embeddings
 *   createdAt: z.date(),                     // NOT included in embeddings
 * });
 *
 * @param schema - The Zod schema to mark as embeddable
 * @param path - Optional path identifier for the field (used for nested extraction)
 * @returns The same schema with embeddable metadata attached
 */
export function embeddable<T extends z.ZodTypeAny>(
  schema: T,
  path?: string
): EmbeddableSchema<T> {
  const metadata: EmbeddableMetadata = { embeddable: true };
  if (path) {
    metadata.path = path;
  }
  (schema as EmbeddableSchema<T>)[EMBEDDABLE_KEY] = metadata;
  return schema as EmbeddableSchema<T>;
}

/**
 * Checks if a Zod schema has been marked as embeddable
 *
 * @param schema - The Zod schema to check
 * @returns True if the schema is marked as embeddable
 */
export function isEmbeddable(schema: z.ZodTypeAny): boolean {
  return EMBEDDABLE_KEY in schema && (schema as EmbeddableSchema<z.ZodTypeAny>)[EMBEDDABLE_KEY]?.embeddable === true;
}

/**
 * Gets the embeddable metadata from a schema if it exists
 *
 * @param schema - The Zod schema to get metadata from
 * @returns The embeddable metadata or undefined
 */
export function getEmbeddableMetadata(
  schema: z.ZodTypeAny
): EmbeddableMetadata | undefined {
  if (isEmbeddable(schema)) {
    return (schema as EmbeddableSchema<z.ZodTypeAny>)[EMBEDDABLE_KEY];
  }
  return undefined;
}

/**
 * Extracts embeddable field names from a Zod object schema.
 * Recursively checks nested objects for embeddable fields.
 *
 * @param schema - A Zod object schema
 * @returns Array of field names that are marked as embeddable
 */
export function getEmbeddableFields(
  schema: z.ZodObject<z.ZodRawShape>
): string[] {
  const embeddableFields: string[] = [];
  const shape = schema.shape;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    let unwrappedSchema = fieldSchema as z.ZodTypeAny;

    // Unwrap optional, nullable, and default wrappers
    while (
      unwrappedSchema instanceof z.ZodOptional ||
      unwrappedSchema instanceof z.ZodNullable ||
      unwrappedSchema instanceof z.ZodDefault
    ) {
      unwrappedSchema = unwrappedSchema._def.innerType;
    }

    if (isEmbeddable(unwrappedSchema)) {
      embeddableFields.push(key);
    }
  }

  return embeddableFields;
}

/**
 * Extracts values from an object for all embeddable fields defined in its schema.
 * Returns an array of non-empty string values that should be embedded.
 *
 * @param schema - A Zod object schema with embeddable fields marked
 * @param data - The object to extract values from
 * @returns Array of string values from embeddable fields
 */
export function extractEmbeddableValues(
  schema: z.ZodObject<z.ZodRawShape>,
  data: Record<string, unknown>
): string[] {
  const embeddableFields = getEmbeddableFields(schema);
  const values: string[] = [];

  for (const field of embeddableFields) {
    const value = data[field];
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.trim()) {
        values.push(value.trim());
      } else if (Array.isArray(value)) {
        // Handle arrays (like skills)
        const arrayValues = value
          .map((item) => {
            if (typeof item === 'string') {
              return item;
            } else if (typeof item === 'object' && item !== null && 'name' in item) {
              return (item as { name: string }).name;
            }
            return null;
          })
          .filter(Boolean) as string[];
        if (arrayValues.length > 0) {
          values.push(arrayValues.join(', '));
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects - extract string values
        const nestedValues = Object.values(value as Record<string, unknown>)
          .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
          .join(', ');
        if (nestedValues) {
          values.push(nestedValues);
        }
      }
    }
  }

  return values;
}

/**
 * Prepares embeddable data from an object using its schema.
 * Combines all embeddable field values into a single string for embedding.
 *
 * @param schema - A Zod object schema with embeddable fields marked
 * @param data - The object to prepare for embedding
 * @returns A single string combining all embeddable values, separated by periods
 */
export function prepareForEmbedding(
  schema: z.ZodObject<z.ZodRawShape>,
  data: Record<string, unknown>
): string {
  const values = extractEmbeddableValues(schema, data);
  return values.join('. ');
}

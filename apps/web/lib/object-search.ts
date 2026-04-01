import type { ObjectRecord } from '@object-atlas/types';

export function filterObjectsByTitle(
  objects: ObjectRecord[],
  searchQuery: string
): ObjectRecord[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return objects;
  }

  return objects.filter((object) => object.title.toLowerCase().includes(normalizedQuery));
}

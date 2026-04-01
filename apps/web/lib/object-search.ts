import type { ObjectRecord } from '@object-atlas/types';

export function filterObjectsByTitle(
  objects: ObjectRecord[],
  searchQuery: string,
  selectedTag?: string | null
): ObjectRecord[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedTag = selectedTag?.trim().toLowerCase() ?? '';

  return objects.filter((object) => {
    const matchesQuery =
      !normalizedQuery ||
      object.title.toLowerCase().includes(normalizedQuery) ||
      object.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    const matchesTag =
      !normalizedTag || object.tags.some((tag) => tag.toLowerCase() === normalizedTag);

    return matchesQuery && matchesTag;
  });
}

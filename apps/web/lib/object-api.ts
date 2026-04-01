export type ObjectRecord = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  story: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function getObjects(): Promise<ObjectRecord[]> {
  const response = await fetch(`${apiBaseUrl}/api/objects`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as ObjectRecord[];
}

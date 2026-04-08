import { ObjectWorkspacePage } from '../../components/object-workspace-page';
import { getCollections } from '../../lib/collection-api';
import { getObjects } from '../../lib/object-api';

export default async function ObjectsPage({
  searchParams
}: {
  searchParams: Promise<{ collectionId?: string }>;
}) {
  const { collectionId } = await searchParams;
  const [collections, objects] = await Promise.all([
    getCollections(),
    getObjects(undefined, collectionId)
  ]);

  return (
    <ObjectWorkspacePage
      initialCollectionFilter={collectionId ?? null}
      initialCollections={collections}
      initialObjects={objects}
    />
  );
}

import { CollectionWorkspacePage } from '../../components/collection-workspace-page';
import { getCollections } from '../../lib/collection-api';
import { getObjects } from '../../lib/object-api';

export default async function CollectionsPage() {
  const [collections, objects] = await Promise.all([getCollections(), getObjects()]);

  return <CollectionWorkspacePage initialCollections={collections} initialObjects={objects} />;
}

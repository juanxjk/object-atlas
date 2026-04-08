import { CollectionWorkspacePage } from '../../components/collection-workspace-page';
import { getCollections } from '../../lib/object-api';

export default async function CollectionsPage() {
  const collections = await getCollections();

  return <CollectionWorkspacePage initialCollections={collections} />;
}

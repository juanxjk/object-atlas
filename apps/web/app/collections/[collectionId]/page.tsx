import { notFound } from 'next/navigation';

import { CollectionDetailPage } from '../../../components/collection-detail-page';
import { getCollection } from '../../../lib/object-api';

export default async function CollectionDetailRoute({
  params
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const collection = await getCollection(collectionId);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailPage collection={collection} />;
}

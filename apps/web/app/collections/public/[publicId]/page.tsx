import { notFound } from 'next/navigation';

import { PublicCollectionPage } from '../../../../components/public-collection-page';
import { getPublicCollection } from '../../../../lib/collection-api';

export default async function PublicCollectionRoute({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const collection = await getPublicCollection(publicId);

  if (!collection) {
    notFound();
  }

  return <PublicCollectionPage collection={collection} />;
}

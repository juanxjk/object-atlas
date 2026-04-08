import { notFound } from 'next/navigation';

import { PublicObjectPage } from '../../../components/public-object-page';
import { getPublicObject } from '../../../lib/object-api';

export default async function PublicObjectRoute({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const object = await getPublicObject(publicId);

  if (!object) {
    notFound();
  }

  return <PublicObjectPage object={object} />;
}

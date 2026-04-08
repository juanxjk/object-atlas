import { ObjectWorkspacePage } from '../../components/object-workspace-page';
import { getObjects } from '../../lib/object-api';

export default async function ObjectsPage() {
  const objects = await getObjects();

  return <ObjectWorkspacePage initialObjects={objects} />;
}

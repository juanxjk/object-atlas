import { HomePageRefresh } from '../components/home-page-refresh';
import { getObjects } from '../lib/object-api';

export default async function HomePage() {
  const objects = await getObjects();

  return <HomePageRefresh initialObjects={objects} />;
}

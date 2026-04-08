import { LandingPage } from '../components/landing-page';
import { getObjects } from '../lib/object-api';

export default async function HomePage() {
  const objects = await getObjects();

  return <LandingPage initialObjects={objects} />;
}

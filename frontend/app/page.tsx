import HomePage from '@/components/HomePage';
import HomePageWrapper from '@/components/HomePageWrapper';

export const dynamic = 'force-static';
export const revalidate = false;

export default function Home() {
  return (
    <HomePageWrapper>
      <HomePage />
    </HomePageWrapper>
  );
}

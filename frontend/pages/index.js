import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return <LoadingSpinner text="Redirecting to Dashboard..." />;
} 
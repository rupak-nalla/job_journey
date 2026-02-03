"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // If authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // If not authenticated, redirect to login
        router.replace('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking auth
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ fontSize: '16px', color: 'white' }}>Loading...</div>
    </div>
  );
}

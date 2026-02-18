'use client';

import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export function useAuth() {
  const router = useRouter();

  const logout = () => {
    apiClient.logout();
    router.push('/login');
  };

  return { logout };
}

/**
 * Admin Authentication Hooks
 * 
 * React Query hooks for admin authentication.
 */

import { useMutation } from '@tanstack/react-query';
import { adminLogin, adminLogout } from '@/lib/api/admin-auth';
import { useAdminSession } from './useAdminSession';
import { useRouter } from 'next/navigation';

/**
 * Admin login mutation
 */
export function useAdminLogin() {
  const { login } = useAdminSession();
  const router = useRouter();

  return useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      login(data.token, data.admin);
      router.push('/admin/dashboard');
    },
  });
}

/**
 * Admin logout mutation
 */
export function useAdminLogout() {
  const { logout } = useAdminSession();
  const router = useRouter();

  return useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      logout();
      router.push('/admin/login');
    },
  });
}


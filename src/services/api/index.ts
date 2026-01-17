// API Service Factory - Switch between backends easily

import type { IApiService } from './interfaces';
import { SupabaseApiService } from './supabase';
import { DjangoApiService } from './django';
import { PhpApiService } from './php';

// Backend types
export type BackendType = 'supabase' | 'django' | 'php';

// Get backend type from environment
const getBackendType = (): BackendType => {
  const backend = import.meta.env.VITE_API_BACKEND as BackendType;
  if (backend && ['supabase', 'django', 'php'].includes(backend)) {
    return backend;
  }
  return 'supabase'; // Default
};

// Factory function to create API service
const createApiService = (backend: BackendType): IApiService => {
  switch (backend) {
    case 'django':
      return new DjangoApiService();
    case 'php':
      return new PhpApiService();
    case 'supabase':
    default:
      return new SupabaseApiService();
  }
};

// Current backend type
export const currentBackend = getBackendType();

// Export the API service instance
export const api: IApiService = createApiService(currentBackend);

// Re-export types and interfaces
export * from './types';
export * from './interfaces';

// Re-export individual services for direct access if needed
export { SupabaseApiService } from './supabase';
export { DjangoApiService } from './django';
export { PhpApiService } from './php';

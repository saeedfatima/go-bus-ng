// API Service Factory - Standardized on Django backend
import type { IApiService } from './interfaces';
import { DjangoApiService } from './django';

// Export the API service instance
// Locked to Django as per project requirements
export const currentBackend = 'django';
export const api: IApiService = new DjangoApiService();

// Re-export types and interfaces
export * from './types';
export * from './interfaces';

// Re-export individual services for direct access if needed
export { DjangoApiService } from './django';

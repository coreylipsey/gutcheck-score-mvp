'use client';

import { setupDependencies } from '../../infrastructure/di/setup';

interface DependencyProviderProps {
  children: React.ReactNode;
}

// Initialize dependencies immediately when module is loaded
setupDependencies();

export function DependencyProvider({ children }: DependencyProviderProps) {
  return <>{children}</>;
} 
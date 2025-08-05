'use client';

import { useEffect } from 'react';
import { setupDependencies } from '../../infrastructure/di/setup';

interface DependencyProviderProps {
  children: React.ReactNode;
}

export function DependencyProvider({ children }: DependencyProviderProps) {
  useEffect(() => {
    // Initialize dependency injection container
    setupDependencies();
  }, []);

  return <>{children}</>;
} 
'use client';

import { Lock } from 'lucide-react';

interface ComingSoonOverlayProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showPreview?: boolean;
  className?: string;
}

export function ComingSoonOverlay({ 
  children, 
  title = "Coming Soon",
  description = "This premium feature will be available soon.",
  showPreview = true,
  className = ''
}: ComingSoonOverlayProps) {

  return (
    <div className={`relative ${className}`}>
      {/* Preview content - shows a glimpse of what's coming */}
      {showPreview && (
        <div className="relative">
          {children}
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
            <div className="text-center p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-xs">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
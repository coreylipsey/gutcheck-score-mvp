'use client';

import { useState } from 'react';
import { Lock, Bell, X } from 'lucide-react';

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
  description = "This premium feature will be available soon. Sign up to be notified when it launches.",
  showPreview = true,
  className = ''
}: ComingSoonOverlayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implement actual notification subscription
      console.log('Subscribing email:', email);
      setIsSubscribed(true);
      setTimeout(() => {
        setShowDetails(false);
        setIsSubscribed(false);
        setEmail('');
      }, 2000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Preview content - shows a glimpse of what's coming */}
      {showPreview && (
        <div className="relative">
          {children}
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
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
              <button
                onClick={() => setShowDetails(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                Get Notified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for notification signup */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Be the First to Know
              </h3>
              
              <p className="text-gray-600 mb-6">
                Get notified when this premium feature launches. We'll send you an email as soon as it's available.
              </p>

              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    Don't worry, we won't spam you :)
                  </p>
                </form>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium">
                    Thanks! We'll notify you when this feature is ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
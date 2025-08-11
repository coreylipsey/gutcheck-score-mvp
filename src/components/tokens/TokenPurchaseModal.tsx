'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Check, Coins, CreditCard } from 'lucide-react';
import { useAuthContext } from '@/presentation/providers/AuthProvider';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (newBalance: number) => void;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  savings?: number;
  popular?: boolean;
  features: string[];
  description: string;
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 100,
    price: 29,
    description: 'Perfect for trying out premium features',
    features: [
      '100 tokens included',
      'Access to all AI agents',
      'Premium insights',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    tokens: 300,
    price: 79,
    savings: 8,
    popular: true,
    description: 'Best value for regular users',
    features: [
      '300 tokens included',
      'Access to all AI agents',
      'Premium insights',
      'Advanced analytics',
      'Priority support',
      'Custom reports'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tokens: 1000,
    price: 199,
    savings: 35,
    description: 'For teams and heavy users',
    features: [
      '1,000 tokens included',
      'Access to all AI agents',
      'Premium insights',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'Team collaboration',
      'API access'
    ]
  }
];

export function TokenPurchaseModal({ isOpen, onClose, onPurchaseSuccess }: TokenPurchaseModalProps) {
  const { user } = useAuthContext();
  const [selectedPackage, setSelectedPackage] = useState<string>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    const pkg = tokenPackages.find(p => p.id === selectedPackage);
    if (!pkg || !user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/tokens/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          tokens: pkg.tokens,
          price: pkg.price,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPackage('professional');
    setError(null);
    onClose();
  };

  const selectedPkg = tokenPackages.find(p => p.id === selectedPackage);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <Dialog.Title className="text-2xl text-[#0A1F44] font-semibold">
                Purchase Tokens
              </Dialog.Title>
              <p className="text-sm text-gray-600 mt-2">
                Unlock premium features and AI agents with Gutcheck tokens. Choose the package that fits your needs.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Package Selection */}
            <div className="grid md:grid-cols-3 gap-4">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all duration-200 border-2 rounded-lg ${
                    selectedPackage === pkg.id 
                      ? 'ring-2 ring-[#147AFF] border-[#147AFF]' 
                      : 'hover:border-[#147AFF]/50 border-gray-200'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#FF6B00] text-white border-0 px-2 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-lg text-[#0A1F44] font-semibold">
                          {pkg.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Coins className="w-5 h-5 text-[#147AFF]" />
                          <span className="text-2xl text-[#0A1F44]">
                            {pkg.tokens.toLocaleString()}
                          </span>
                          <span className="text-sm text-slate-500">tokens</span>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-3xl text-[#0A1F44]">
                            ${pkg.price}
                          </span>
                          {pkg.savings && (
                            <span className="bg-[#19C2A0]/10 text-[#19C2A0] border-[#19C2A0] px-2 py-1 rounded-full text-xs font-medium ml-2">
                              Save ${pkg.savings}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="w-4 h-4 text-[#19C2A0]" />
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Section */}
            <div className="border-t pt-6">
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <h4 className="text-lg text-[#0A1F44] font-semibold">Order Summary</h4>
                
                {selectedPkg && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Package</span>
                      <span className="text-[#0A1F44]">{selectedPkg.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Tokens</span>
                      <span className="text-[#0A1F44]">{selectedPkg.tokens.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-[#0A1F44]">Total</span>
                      <span className="text-[#0A1F44]">${selectedPkg.price}</span>
                    </div>

                    {selectedPkg.savings && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#19C2A0]">You save</span>
                        <span className="text-[#19C2A0]">${selectedPkg.savings}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="text-lg text-[#0A1F44] font-semibold">Payment Method</h4>
              
              <div className="border-[#147AFF]/20 border-2 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-[#147AFF]" />
                  <div>
                    <p className="text-[#0A1F44] font-medium">Secure Payment via Stripe</p>
                    <p className="text-sm text-slate-600">
                      Your payment is processed securely. We don't store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="bg-[#147AFF] hover:bg-[#147AFF]/90 text-white min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Purchase ${selectedPkg?.tokens.toLocaleString()} Tokens`
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Helper function to load Stripe
async function loadStripe(publishableKey: string) {
  if (typeof window === 'undefined') return null;
  
  try {
    const { loadStripe } = await import('@stripe/stripe-js');
    return await loadStripe(publishableKey);
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
} 
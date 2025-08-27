import { useState } from 'react';
import { User, Building, AlertTriangle, Shield, Lock } from 'lucide-react';

interface ContextSwitcherProps {
  currentContext: 'personal' | 'enterprise';
  organizationName?: string;
  onContextSwitch: (context: 'personal' | 'enterprise') => void;
  userRoles: string[];
}

export function ContextSwitcher({ 
  currentContext, 
  organizationName, 
  onContextSwitch, 
  userRoles 
}: ContextSwitcherProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingContext, setPendingContext] = useState<'personal' | 'enterprise' | null>(null);

  const hasPersonalRole = userRoles.includes('henri');
  const hasEnterpriseRole = userRoles.includes('partner') || userRoles.includes('admin');

  const handleContextSwitch = (newContext: 'personal' | 'enterprise') => {
    if (newContext === currentContext) return;
    
    // If switching to enterprise, show confirmation modal
    if (newContext === 'enterprise') {
      setPendingContext(newContext);
      setShowConfirmation(true);
    } else {
      // Switching to personal is always allowed
      onContextSwitch(newContext);
    }
  };

  const confirmSwitch = () => {
    if (pendingContext) {
      onContextSwitch(pendingContext);
      setShowConfirmation(false);
      setPendingContext(null);
    }
  };

  const cancelSwitch = () => {
    setShowConfirmation(false);
    setPendingContext(null);
  };

  return (
    <>
      <div className="context-switcher bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Switch Context</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${currentContext === 'personal' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <span className="text-xs text-gray-500">
              {currentContext === 'personal' ? 'Personal' : 'Enterprise'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {hasPersonalRole && (
            <button
              onClick={() => handleContextSwitch('personal')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                currentContext === 'personal'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Personal Dashboard</span>
              </div>
              {currentContext === 'personal' && (
                <Shield className="w-4 h-4 text-blue-500" />
              )}
            </button>
          )}

          {hasEnterpriseRole && (
            <button
              onClick={() => handleContextSwitch('enterprise')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                currentContext === 'enterprise'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  {organizationName ? `${organizationName} Dashboard` : 'Enterprise Dashboard'}
                </span>
              </div>
              {currentContext === 'enterprise' && (
                <Lock className="w-4 h-4 text-green-500" />
              )}
            </button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {currentContext === 'personal' 
              ? 'Viewing your personal assessment data and insights'
              : 'Viewing enterprise cohort data and analytics'
            }
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Switch to Enterprise Context?</h3>
                <p className="text-sm text-gray-600">You're about to access institutional data</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">What this means:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You'll see cohort analytics and participant data</li>
                <li>• All actions are logged for compliance</li>
                <li>• Your personal data remains protected</li>
                <li>• You can switch back to personal view anytime</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelSwitch}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Enterprise
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

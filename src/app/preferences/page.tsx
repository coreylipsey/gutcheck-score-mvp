'use client';

import { useState, useEffect } from 'react';

// Remove missing UI component imports and use standard HTML elements
interface UserPreferences {
  resultsEmails: boolean;
  followUpEmails: boolean;
  aiInsights: boolean;
  partnerUpdates: boolean;
  marketingEmails: boolean;
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    resultsEmails: true,
    followUpEmails: true,
    aiInsights: true,
    partnerUpdates: false,
    marketingEmails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load user preferences from localStorage for now
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // TODO: Implement loading preferences from Firestore
      setLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    try {
      setSaving(true);
      // TODO: Implement saving preferences to Firestore
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    } catch (error) {
      console.error('Error saving preference:', error);
      // Revert the change on error
      setPreferences(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your email preferences and notification settings
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Email Preferences Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h2>
              <div className="space-y-6">
                {/* Results Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Assessment Results</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive detailed analysis and insights from your assessments
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.resultsEmails ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => handlePreferenceChange('resultsEmails', !preferences.resultsEmails)}
                      disabled={saving}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.resultsEmails ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Follow-up Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Follow-up Emails</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get reminders and follow-up content to help you improve
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.followUpEmails ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => handlePreferenceChange('followUpEmails', !preferences.followUpEmails)}
                      disabled={saving}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.followUpEmails ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive personalized AI-generated insights and recommendations
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.aiInsights ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => handlePreferenceChange('aiInsights', !preferences.aiInsights)}
                      disabled={saving}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.aiInsights ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketing & Updates</h2>
              <div className="space-y-6">
                {/* Partner Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Partner Updates</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get updates about new features and partner opportunities
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.partnerUpdates ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => handlePreferenceChange('partnerUpdates', !preferences.partnerUpdates)}
                      disabled={saving}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.partnerUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive promotional content and special offers
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => handlePreferenceChange('marketingEmails', !preferences.marketingEmails)}
                      disabled={saving}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Status */}
            {saving && (
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-600">Saving preferences...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Shield, Building, Lock, Globe, FileText, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface TrustFabricBannerProps {
  context: 'personal' | 'enterprise';
  showInternational?: boolean;
  showCompliance?: boolean;
}

export function TrustFabricBanner({ context, showInternational = true, showCompliance = true }: TrustFabricBannerProps) {
  return (
    <div className="trust-fabric-banner bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trust Fabric: Enterprise-Grade Data Protection
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Gutcheck.AI is the only entrepreneurial assessment platform designed to meet enterprise trust and legal standards by default. 
          Our dual-identity architecture ensures zero data leakage between personal entrepreneurial development and institutional program evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="trust-pillar text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Journey Protection</h3>
          <p className="text-sm text-gray-600">
            Your entrepreneurial insights remain private and personal. 
            {context === 'personal' && (
              <span className="block mt-2 text-blue-600 font-medium">
                ✓ You're viewing your personal data
              </span>
            )}
          </p>
        </div>
        
        <div className="trust-pillar text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Visibility</h3>
          <p className="text-sm text-gray-600">
            Institutions get the cohort analytics they need without compromising individual privacy.
            {context === 'enterprise' && (
              <span className="block mt-2 text-green-600 font-medium">
                ✓ You're viewing enterprise data
              </span>
            )}
          </p>
        </div>
        
        <div className="trust-pillar text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero Data Leakage</h3>
          <p className="text-sm text-gray-600">
            Complete separation between personal and enterprise contexts with full auditability.
          </p>
        </div>
      </div>

      {/* Compliance & International Section */}
      {showCompliance && (
        <div className="compliance-section bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Built-in Compliance & Audit
            </h3>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">FERPA</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GDPR</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">CCPA</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Compliance-Ready Reports</h4>
              <p className="text-sm text-gray-600 mb-3">
                Audit events are packaged into compliance-ready reports (GDPR, FERPA, CCPA) and delivered to enterprise admins quarterly.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Automated compliance reporting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Data processing agreements included
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  FERPA school official designation
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Procurement Velocity</h4>
              <p className="text-sm text-gray-600 mb-3">
                By baking compliance into the architecture, Gutcheck shortens procurement cycles and increases win rates with universities and workforce agencies.
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <span>50% faster procurement cycles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* International Compliance */}
      {showInternational && (
        <div className="international-section bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Globe className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Global Compliance Ready</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Built for international expansion with GDPR, CCPA, and regional privacy regulation compliance out of the box.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">GDPR (EU)</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">CCPA (California)</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">LGPD (Brazil)</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">PIPEDA (Canada)</span>
          </div>
        </div>
      )}

      {/* Context Warning */}
      {context === 'enterprise' && (
        <div className="context-warning bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Enterprise Context Active</h4>
              <p className="text-sm text-yellow-700">
                You are now accessing institutional data. Personal assessment data is protected and separate. 
                All actions are logged for compliance and audit purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

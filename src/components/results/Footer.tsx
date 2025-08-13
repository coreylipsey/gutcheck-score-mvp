import Link from "next/link";
import { Mail, Share2, Download, BookOpen, Users, Target } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#147AFF] to-[#19C2A0] flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#0A1F44' }}>
                Gutcheck.AI
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering entrepreneurs with AI-powered assessments and personalized insights to accelerate their journey to success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ color: '#0A1F44' }}>
              Quick Actions
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>View Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </Link>
              </li>
              <li>
                <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Results</span>
                </button>
              </li>
              <li>
                <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share Results</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ color: '#0A1F44' }}>
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Entrepreneurship Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Funding Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Mentor Network
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ color: '#0A1F44' }}>
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              &copy; 2025 Gutcheck.AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Join 10,000+ entrepreneurs</span>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Trusted by founders worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
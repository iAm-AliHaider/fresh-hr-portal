"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showAutoRedirect, setShowAutoRedirect] = useState(false);

  // Don't auto-redirect, let users choose their path
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setShowAutoRedirect(true);
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Fresh HR Portal
                </h1>
                <p className="text-sm text-gray-600">
                  Complete HR Management System
                </p>
              </div>
            </div>

            {showAutoRedirect ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/careers")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse Jobs
                </button>
                <button
                  onClick={() => router.push("/auth/candidate/login")}
                  className="text-blue-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Candidate Login
                </button>
                <button
                  onClick={() => router.push("/auth/employee/login")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Employee Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Fresh HR</span>{" "}
            <span className="text-green-600">Portal</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            A comprehensive Human Resources management system connecting
            talented candidates with exciting opportunities and providing
            employees with powerful tools for career growth.
          </p>

          {/* User Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Candidate Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:border-blue-300 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Job Seekers
                </h3>
                <p className="text-gray-600 mb-6">
                  Discover amazing career opportunities and track your
                  application progress through our comprehensive recruitment
                  portal.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push("/auth/candidate/login")}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => router.push("/auth/candidate/signup")}
                      className="border border-blue-600 text-blue-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                  <button
                    onClick={() => router.push("/careers")}
                    className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Browse Jobs
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Candidate Features:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Application tracking
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Interview scheduling
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Real-time updates
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Profile management
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Employee Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:border-green-300 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Employees
                </h3>
                <p className="text-gray-600 mb-6">
                  Access your personalized dashboard with comprehensive HR tools
                  for managing your work life and career development.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push("/auth/employee/login")}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => router.push("/auth/employee/signup")}
                      className="border border-green-600 text-green-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Quick Access
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Employee Features:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Leave management
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Attendance tracking
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Performance reviews
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Benefits enrollment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/careers")}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Explore Careers
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>

            <button
              onClick={() => router.push("/candidate/portal")}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              <Users className="h-5 w-5 mr-2" />
              Candidate Portal
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Complete HR Management Solution
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From talent acquisition to employee development, our platform
              handles every aspect of human resources management with separate
              dedicated portals for candidates and employees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Recruitment */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Recruitment
              </h4>
              <p className="text-gray-600">
                Streamlined application process with automated tracking and
                intelligent candidate matching.
              </p>
            </div>

            {/* Employee Management */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Employee Management
              </h4>
              <p className="text-gray-600">
                Complete employee lifecycle management with performance tracking
                and development tools.
              </p>
            </div>

            {/* Leave Management */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Automated Workflows
              </h4>
              <p className="text-gray-600">
                Efficient processes for leave management, approvals, and
                administrative tasks.
              </p>
            </div>

            {/* Reporting */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h4>
              <p className="text-gray-600">
                Real-time application status updates and comprehensive
                recruitment journey visualization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Whether you&apos;re looking for your next career opportunity or
            managing your team, we have the tools you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/careers")}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-lg"
            >
              <Globe className="h-5 w-5 mr-2" />
              Browse Open Positions
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>

            <button
              onClick={() => router.push("/recruitment")}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 text-lg font-semibold shadow-lg"
            >
              <Building2 className="h-5 w-5 mr-2" />
              HR Management
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-gray-300">
                © 2024 Fresh HR Portal. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <button className="text-gray-400 hover:text-gray-300 text-sm">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-gray-300 text-sm">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-gray-300 text-sm">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

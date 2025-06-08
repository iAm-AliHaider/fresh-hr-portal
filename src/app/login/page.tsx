"use client";

import { ArrowRight, User, Users } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to HR Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your login type to continue
          </p>
        </div>

        {/* Login Options */}
        <div className="mt-8 space-y-4">
          {/* Employee Login */}
          <Link
            href="/auth/employee/login"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Users className="h-5 w-5 text-green-200 group-hover:text-green-100" />
            </span>
            <span className="flex items-center">
              Employee Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Link>

          {/* Candidate Login */}
          <Link
            href="/auth/candidate/login"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <User className="h-5 w-5 text-blue-200 group-hover:text-blue-100" />
            </span>
            <span className="flex items-center">
              Candidate Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <div className="text-sm space-y-2">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/candidate/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up as a candidate
              </Link>
            </p>
            <p className="text-gray-600">
              <Link
                href="/careers"
                className="font-medium text-gray-700 hover:text-gray-500"
              >
                Browse job opportunities
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

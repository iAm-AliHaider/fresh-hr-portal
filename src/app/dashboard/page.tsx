"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  LogOut,
  Settings,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// HR Portal Feature Roadmap - Updated with completed recruitment features
const hrFeatures = [
  {
    category: "Employee Management",
    icon: Users,
    color: "blue",
    features: [
      { name: "Employee Profiles", status: "completed", priority: "high" },
      { 
        name: "Employee Directory", 
        status: "completed", 
        priority: "high",
        route: "/employees"
      },
      { name: "Employee Onboarding", status: "planned", priority: "medium" },
      { name: "Employee Offboarding", status: "planned", priority: "medium" },
      { name: "Organization Chart", status: "planned", priority: "low" },
      { name: "Employee Documents", status: "planned", priority: "medium" },
    ],
  },
  {
    category: "Recruitment & Hiring",
    icon: UserPlus,
    color: "purple",
    features: [
      {
        name: "Job Postings",
        status: "completed",
        priority: "high",
        route: "/jobs",
      },
      {
        name: "Public Careers Portal",
        status: "completed",
        priority: "high",
        route: "/careers",
      },
      {
        name: "Application Management",
        status: "completed",
        priority: "high",
        route: "/jobs",
      },
      {
        name: "Candidate Application Tracking",
        status: "completed",
        priority: "high",
      },
      { name: "Interview Scheduling", status: "completed", priority: "high" },
      {
        name: "Candidate Communication",
        status: "planned",
        priority: "medium",
      },
      { 
        name: "Offer Management", 
        status: "completed", 
        priority: "medium",
        route: "/offers"
      },
      { name: "Onboarding Process", status: "planned", priority: "high" },
    ],
  },
  {
    category: "Time & Attendance",
    icon: Clock,
    color: "purple",
    features: [
      { name: "Time Tracking", status: "planned", priority: "high" },
      { name: "Clock In/Out", status: "planned", priority: "high" },
      { name: "Timesheet Management", status: "planned", priority: "medium" },
      { name: "Overtime Tracking", status: "planned", priority: "medium" },
      { name: "Shift Scheduling", status: "planned", priority: "low" },
      { name: "Attendance Reports", status: "planned", priority: "medium" },
    ],
  },
  {
    category: "Leave Management",
    icon: Calendar,
    color: "orange",
    features: [
      { name: "Leave Requests", status: "planned", priority: "high" },
      { name: "Leave Approval Workflow", status: "planned", priority: "high" },
      { name: "Leave Balance Tracking", status: "planned", priority: "medium" },
      { name: "Holiday Calendar", status: "planned", priority: "medium" },
      { name: "Leave Policies", status: "planned", priority: "low" },
      { name: "Leave Reports", status: "planned", priority: "medium" },
    ],
  },
  {
    category: "Payroll Management",
    icon: DollarSign,
    color: "emerald",
    features: [
      { name: "Salary Management", status: "planned", priority: "high" },
      { name: "Payroll Processing", status: "planned", priority: "high" },
      { name: "Tax Calculations", status: "planned", priority: "high" },
      {
        name: "Benefits Administration",
        status: "planned",
        priority: "medium",
      },
      { name: "Expense Reimbursements", status: "planned", priority: "medium" },
      { name: "Pay Slips", status: "planned", priority: "medium" },
    ],
  },
  {
    category: "Performance Management",
    icon: TrendingUp,
    color: "pink",
    features: [
      { name: "Performance Reviews", status: "planned", priority: "medium" },
      { name: "Goal Setting", status: "planned", priority: "medium" },
      { name: "360-Degree Feedback", status: "planned", priority: "low" },
      { name: "Performance Analytics", status: "planned", priority: "medium" },
      { name: "Career Development Plans", status: "planned", priority: "low" },
      { name: "Skills Assessment", status: "planned", priority: "low" },
    ],
  },
  {
    category: "Training & Development",
    icon: BookOpen,
    color: "indigo",
    features: [
      { name: "Training Programs", status: "planned", priority: "medium" },
      { name: "Course Management", status: "planned", priority: "medium" },
      { name: "Certification Tracking", status: "planned", priority: "low" },
      { name: "Learning Paths", status: "planned", priority: "low" },
      { name: "Training Calendar", status: "planned", priority: "medium" },
      { name: "Skills Development", status: "planned", priority: "low" },
    ],
  },
  {
    category: "Compliance & Safety",
    icon: Shield,
    color: "red",
    features: [
      { name: "Safety Incidents", status: "planned", priority: "high" },
      { name: "Compliance Tracking", status: "planned", priority: "high" },
      { name: "Policy Management", status: "planned", priority: "medium" },
      { name: "Safety Equipment", status: "planned", priority: "medium" },
      { name: "Training Compliance", status: "planned", priority: "medium" },
      { name: "Audit Trails", status: "planned", priority: "high" },
    ],
  },
  {
    category: "Reports & Analytics",
    icon: BarChart3,
    color: "teal",
    features: [
      { name: "Employee Reports", status: "planned", priority: "medium" },
      { name: "Attendance Reports", status: "planned", priority: "medium" },
      { name: "Payroll Reports", status: "planned", priority: "high" },
      { name: "Performance Analytics", status: "planned", priority: "medium" },
      { name: "Compliance Reports", status: "planned", priority: "high" },
      { name: "Custom Dashboards", status: "planned", priority: "low" },
    ],
  },
  {
    category: "Administration",
    icon: Settings,
    color: "gray",
    features: [
      { name: "User Management", status: "completed", priority: "high" },
      {
        name: "Role-Based Access Control",
        status: "completed",
        priority: "high",
      },
      { name: "System Settings", status: "planned", priority: "medium" },
      { name: "Company Settings", status: "planned", priority: "medium" },
      { name: "Integration Management", status: "planned", priority: "low" },
      { name: "Backup & Security", status: "planned", priority: "high" },
    ],
  },
];

export default function DashboardPage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [recruitmentStats, setRecruitmentStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user is a candidate and redirect them to candidate portal
    const candidateAuth = localStorage.getItem("candidateAuth");
    if (candidateAuth) {
      console.log("Dashboard - Candidate detected, redirecting to candidate portal");
      router.push("/candidate/portal");
      return;
    }

    // Ensure only employees/admin can access dashboard
    const employeeAuth = localStorage.getItem("employeeAuth");
    const legacyAuth = localStorage.getItem("hr-auth-token");
    
    if (!employeeAuth && !legacyAuth) {
      console.log("Dashboard - No employee auth found, redirecting to login");
      router.push("/login");
      return;
    }
  }, [isAuthenticated, loading, router]);

  // Fetch recruitment stats
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecruitmentStats();
    }
  }, [isAuthenticated]);

  const fetchRecruitmentStats = async () => {
    try {
      // Get authentication token
      let token = null;
      const employeeAuth = localStorage.getItem("employeeAuth");
      const legacyToken = localStorage.getItem("hr-auth-token");
      
      if (employeeAuth) {
        const authData = JSON.parse(employeeAuth);
        token = authData.token;
      } else if (legacyToken) {
        token = legacyToken;
      }

      if (!token) {
        console.log("Dashboard - No token available for stats fetch");
        return;
      }

      const jobsResponse = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const jobs = jobsData.jobs || [];

        // Calculate total applications across all jobs
        const totalApplications = jobs.reduce(
          (acc: number, job: { _count?: { applications?: number } }) =>
            acc + (job._count?.applications || 0),
          0
        );

        setRecruitmentStats({
          totalJobs: jobs.length,
          openJobs: jobs.filter(
            (job: { status: string }) => job.status === "OPEN"
          ).length,
          totalApplications,
          recentApplications: totalApplications, // For now, show all as recent
        });
      } else if (jobsResponse.status === 401) {
        console.log("Dashboard - Unauthorized, clearing auth");
        localStorage.removeItem("employeeAuth");
        localStorage.removeItem("hr-auth-token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching recruitment stats:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate progress statistics
  const totalFeatures = hrFeatures.reduce(
    (acc, category) => acc + category.features.length,
    0
  );
  const completedFeatures = hrFeatures.reduce(
    (acc, category) =>
      acc + category.features.filter((f) => f.status === "completed").length,
    0
  );
  const inProgressFeatures = hrFeatures.reduce(
    (acc, category) =>
      acc + category.features.filter((f) => f.status === "in-progress").length,
    0
  );
  const completionPercentage = Math.round(
    (completedFeatures / totalFeatures) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Portal</h1>
              <p className="text-gray-600">
                Welcome back, {user?.employee?.first_name || user?.email}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open("/careers", "_blank")}
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Globe className="h-4 w-4 mr-2" />
                Public Portal
                <ExternalLink className="h-3 w-3 ml-1" />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "progress"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🚀 Feature Progress
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "statistics"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📈 Statistics
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Fresh HR Portal
                    </h2>
                    <p className="text-white font-medium text-lg opacity-90">
                      Welcome to your HR management dashboard
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-white opacity-90">
                        {recruitmentStats.openJobs} open positions •{" "}
                        {recruitmentStats.totalApplications} pending
                        applications
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    System Status
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        User Information
                      </h3>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Email
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {user?.email}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Role
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {user?.userType}
                          </dd>
                        </div>
                        {user?.employee && (
                          <>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Department
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {user.employee.department}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Position
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {user.employee.position}
                              </dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        System Status
                      </h3>
                      <div className="mt-2 space-y-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Authentication Working
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          ✅ Database Connected
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          ✅ Public Portal Live
                        </span>
                        <div className="pt-2">
                          <div className="text-sm font-medium text-gray-500">
                            Development Progress
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {completionPercentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {completedFeatures} completed, {inProgressFeatures}{" "}
                            in progress,{" "}
                            {totalFeatures -
                              completedFeatures -
                              inProgressFeatures}{" "}
                            planned
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push("/careers")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">
                      Careers Portal
                    </div>
                    <div className="text-sm text-gray-600">
                      View public job listings
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/jobs")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">
                      Job Management
                    </div>
                    <div className="text-sm text-gray-600">
                      Manage job postings
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/interviews")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">
                      Interview Management
                    </div>
                    <div className="text-sm text-gray-600">
                      Schedule and track interviews
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/employees")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">
                      Employee Directory
                    </div>
                    <div className="text-sm text-gray-600">Manage and view all employees</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  🚀 HR Portal Development Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {completedFeatures}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{
                          width: `${
                            (completedFeatures / totalFeatures) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600">
                      {inProgressFeatures}
                    </div>
                    <div className="text-sm text-gray-500">In Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className="bg-yellow-500 h-3 rounded-full"
                        style={{
                          width: `${
                            (inProgressFeatures / totalFeatures) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-600">
                      {totalFeatures - completedFeatures - inProgressFeatures}
                    </div>
                    <div className="text-sm text-gray-500">Planned</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className="bg-gray-400 h-3 rounded-full"
                        style={{
                          width: `${
                            ((totalFeatures -
                              completedFeatures -
                              inProgressFeatures) /
                              totalFeatures) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {completionPercentage}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Overall Progress
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Feature Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hrFeatures.map((category, index) => {
                  const IconComponent = category.icon;
                  const categoryCompleted = category.features.filter(
                    (f) => f.status === "completed"
                  ).length;
                  const categoryProgress = Math.round(
                    (categoryCompleted / category.features.length) * 100
                  );

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className={`bg-${category.color}-500 px-6 py-4`}>
                        <div className="flex items-center">
                          <IconComponent className="h-6 w-6 text-white mr-3" />
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {category.category}
                            </h4>
                            <p className="text-white opacity-90 text-sm">
                              {categoryCompleted}/{category.features.length}{" "}
                              completed
                            </p>
                          </div>
                          <div className="ml-auto">
                            <div className="text-2xl font-bold text-white">
                              {categoryProgress}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                            <div
                              className="bg-white h-2 rounded-full"
                              style={{ width: `${categoryProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4">
                        <div className="space-y-3">
                          {category.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  {feature.status === "completed" ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : feature.status === "in-progress" ? (
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                  ) : (
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <p
                                    className={`text-sm font-medium ${
                                      feature.status === "completed"
                                        ? "text-gray-900"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {feature.name}
                                  </p>
                                  {feature.route && (
                                    <button
                                      onClick={() => router.push(feature.route)}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Go to feature →
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    feature.priority === "high"
                                      ? "bg-red-100 text-red-800"
                                      : feature.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {feature.priority}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    feature.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : feature.status === "in-progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {feature.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="space-y-6">
              {/* Recruitment Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  📈 Recruitment Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Briefcase className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">
                          Total Jobs
                        </p>
                        <p className="text-3xl font-bold text-blue-900">
                          {recruitmentStats.totalJobs}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">
                          Open Positions
                        </p>
                        <p className="text-3xl font-bold text-green-900">
                          {recruitmentStats.openJobs}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">
                          Total Applications
                        </p>
                        <p className="text-3xl font-bold text-purple-900">
                          {recruitmentStats.totalApplications}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">
                          Recent Apps
                        </p>
                        <p className="text-3xl font-bold text-yellow-900">
                          {recruitmentStats.recentApplications}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  🗓️ Development Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ✅ Phase 1 Complete: Authentication & Basic Structure
                      </p>
                      <p className="text-xs text-gray-500">
                        User management, role-based access control, basic
                        navigation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ✅ Phase 2 Complete: Recruitment Portal
                      </p>
                      <p className="text-xs text-gray-500">
                        Public careers portal, job management, application
                        tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        🔄 Phase 3 In Progress: Interview System
                      </p>
                      <p className="text-xs text-gray-500">
                        Interview scheduling, candidate communication, offer
                        management
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ⏳ Phase 4 Planned: Employee Lifecycle
                      </p>
                      <p className="text-xs text-gray-500">
                        Onboarding, time tracking, leave management, performance
                        reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ⏳ Phase 5 Planned: Payroll & Benefits
                      </p>
                      <p className="text-xs text-gray-500">
                        Salary management, payroll processing, benefits
                        administration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CandidateData {
  id: string;
  candidate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  linkedin_url?: string;
  portfolio_url?: string;
  experience_years?: number;
  current_company?: string;
  current_position?: string;
  skills?: string;
  summary?: string;
}

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  appliedDate: string;
  coverLetter: string;
  resumeUrl?: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    department: string;
    description: string;
    status: string;
    postedDate: string;
  };
  interviews: Array<{
    id: string;
    scheduledDate: string;
    duration: number;
    interviewType: string;
    meetingLink?: string;
    notes?: string;
    status: string;
    location?: string;
  }>;
  offers: Array<{
    id: string;
    position: string;
    department: string;
    salary: number;
    startDate: string;
    expiryDate: string;
    status: string;
    notes?: string;
    offerDate: string;
  }>;
}

export default function CandidatePortalPage() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const authData = localStorage.getItem("candidateAuth");
      console.log("Candidate Portal - Auth data:", authData ? "Found" : "Not found");
      
      if (!authData) {
        console.log("Candidate Portal - No auth data, redirecting to login");
        router.push("/auth/candidate/login");
        return;
      }

      const { user, token } = JSON.parse(authData);
      console.log("Candidate Portal - Parsed auth data:", { user: !!user, token: !!token });
      
      if (!user || !token) {
        console.log("Candidate Portal - Invalid auth data, redirecting to login");
        router.push("/auth/candidate/login");
        return;
      }

      setCandidateData(user.candidate || user);
      console.log("Candidate Portal - Set candidate data:", user.candidate || user);

      // Fetch real applications data from API
      console.log("Candidate Portal - Fetching applications with token:", token.substring(0, 20) + "...");
      
      const response = await fetch("/api/candidate/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Candidate Portal - API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Candidate Portal - API response data:", data);
        
        if (data.success) {
          setApplications(data.applications || []);
          console.log("Candidate Portal - Set applications:", data.applications?.length || 0);
          
          // Update candidate data if available
          if (data.candidateInfo) {
            setCandidateData(prevData => ({
              ...prevData,
              ...data.candidateInfo,
            }));
          }
        } else {
          console.error("Candidate Portal - API returned error:", data.message);
          setError(data.message || "Failed to load applications");
        }
      } else if (response.status === 401) {
        console.log("Candidate Portal - Token expired/invalid, clearing auth and redirecting");
        // Token expired or invalid
        localStorage.removeItem("candidateAuth");
        router.push("/auth/candidate/login");
        return;
      } else {
        console.error("Candidate Portal - API call failed with status:", response.status);
        const errorText = await response.text();
        console.error("Candidate Portal - Error response:", errorText);
        setError("Failed to load your applications");
      }
    } catch (error) {
      console.error("Error loading candidate data:", error);
      setError("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("candidateAuth");
    router.push("/careers");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "SCREENING":
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800";
      case "INTERVIEW":
      case "INTERVIEW_SCHEDULED":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEWED":
      case "COMPLETED":
        return "bg-indigo-100 text-indigo-800";
      case "OFFERED":
      case "OFFER_EXTENDED":
        return "bg-green-100 text-green-800";
      case "HIRED":
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "Application Submitted";
      case "SCREENING":
      case "REVIEWED":
        return "Under Review";
      case "INTERVIEW":
      case "INTERVIEW_SCHEDULED":
        return "Interview Scheduled";
      case "INTERVIEWED":
      case "COMPLETED":
        return "Interview Completed";
      case "OFFERED":
      case "OFFER_EXTENDED":
        return "Offer Extended";
      case "HIRED":
        return "Hired";
      case "REJECTED":
        return "Not Selected";
      default:
        return status;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return 20;
      case "SCREENING":
      case "REVIEWED":
        return 40;
      case "INTERVIEW":
      case "INTERVIEW_SCHEDULED":
        return 60;
      case "INTERVIEWED":
      case "COMPLETED":
        return 80;
      case "OFFERED":
      case "OFFER_EXTENDED":
        return 95;
      case "HIRED":
        return 100;
      case "REJECTED":
        return 0;
      default:
        return 0;
    }
  };

  const handleJoinInterview = (interview: Application['interviews'][0]) => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      alert('Meeting link not available yet. Please check back later or contact HR.');
    }
  };

  const handleAcceptOffer = async () => {
    try {
      // In a real implementation, this would call an API to accept the offer
      alert('Offer acceptance functionality coming soon!');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth/candidate/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 mr-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold mr-3">
                {candidateData?.first_name?.charAt(0) || "C"}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {candidateData?.first_name}{" "}
                  {candidateData?.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                  Candidate ID: {candidateData?.candidate_id}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/careers"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Jobs
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Overview
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      candidateData?.status || "ACTIVE"
                    )}`}
                  >
                    {candidateData?.status === "ACTIVE"
                      ? "Active Candidate"
                      : candidateData?.status}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {candidateData?.email}
                    </p>
                  </div>
                </div>

                {candidateData?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">
                        {candidateData.phone}
                      </p>
                    </div>
                  </div>
                )}

                {candidateData?.experience_years && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Experience
                    </label>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">
                        {candidateData.experience_years} years
                      </p>
                    </div>
                  </div>
                )}

                {candidateData?.current_company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Company
                    </label>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">
                        {candidateData.current_company}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {new Date(
                        candidateData?.created_at || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(candidateData?.linkedin_url ||
                candidateData?.portfolio_url) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Professional Links
                  </h3>
                  <div className="space-y-2">
                    {candidateData?.linkedin_url && (
                      <a
                        href={candidateData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-500"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    )}
                    {candidateData?.portfolio_url && (
                      <a
                        href={candidateData.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-500"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/careers"
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center block"
                >
                  Browse New Jobs
                </Link>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center">
                  View All Applications
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center">
                  Upcoming Interviews
                </button>
              </div>
            </div>

            {/* Skills */}
            {candidateData?.skills && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidateData.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Applications and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Applications
                  </h2>
                  <span className="text-sm text-gray-500">
                    {applications.length} active applications
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <div key={application.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.job.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {application.job.department}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Applied on{" "}
                            {new Date(
                              application.appliedDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="ml-4 text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusText(application.status)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {getProgressPercentage(application.status)}%
                            complete
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Application Progress</span>
                          <span>
                            {getProgressPercentage(application.status)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              application.status === "HIRED"
                                ? "bg-green-500"
                                : application.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${getProgressPercentage(application.status)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-700">
                            {application.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {application.status === "INTERVIEW_SCHEDULED" && (
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700" onClick={() => handleJoinInterview(application.interviews[0])}>
                            Join Interview
                          </button>
                        )}
                        {application.status === "OFFER_EXTENDED" && (
                          <div className="flex space-x-2">
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700" onClick={handleAcceptOffer}>
                              Accept Offer
                            </button>
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                              View Details
                            </button>
                          </div>
                        )}
                        <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Applications Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start your career journey by applying to jobs that match
                      your skills.
                    </p>
                    <Link
                      href="/careers"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recruitment Journey */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Your Recruitment Journey
              </h2>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {[
                    {
                      title: "Profile Created",
                      description: "Account setup completed",
                      status: "completed",
                      date: candidateData?.created_at,
                    },
                    {
                      title: "Job Applications",
                      description: `${applications.length} applications submitted`,
                      status: applications.length > 0 ? "completed" : "pending",
                      date:
                        applications.length > 0
                          ? applications[0]?.appliedDate
                          : null,
                    },
                    {
                      title: "Interview Process",
                      description: applications.some(
                        (app) =>
                          app.status === "INTERVIEW_SCHEDULED" ||
                          app.status === "INTERVIEWED"
                      )
                        ? "Interview scheduled/completed"
                        : "Waiting for interview invitation",
                      status: applications.some(
                        (app) =>
                          app.status === "INTERVIEW_SCHEDULED" ||
                          app.status === "INTERVIEWED"
                      )
                        ? "active"
                        : "pending",
                    },
                    {
                      title: "Job Offer",
                      description: applications.some(
                        (app) => app.status === "OFFER_EXTENDED"
                      )
                        ? "Offer received"
                        : "Awaiting offer decision",
                      status: applications.some(
                        (app) => app.status === "OFFER_EXTENDED"
                      )
                        ? "active"
                        : "pending",
                    },
                    {
                      title: "Welcome to Team",
                      description: applications.some(
                        (app) => app.status === "HIRED"
                      )
                        ? "Congratulations!"
                        : "Start your new role",
                      status: applications.some((app) => app.status === "HIRED")
                        ? "completed"
                        : "pending",
                    },
                  ].map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      <div
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium z-10 ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "active"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === "active" ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium ${
                            step.status === "completed"
                              ? "text-green-900"
                              : step.status === "active"
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                        {step.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

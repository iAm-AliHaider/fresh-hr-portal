"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl?: string;
  coverLetter: string;
  status: string;
  appliedDate: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    employmentType: string;
    description: string;
  };
}

interface Interview {
  id: string;
  scheduledDate: string;
  interviewType: string;
  status: string;
  duration: number;
  meetingLink?: string;
  location?: string;
}

interface ApplicationDetailPageProps {
  params: { id: string };
}

export default function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Redirect if not authenticated or not HR/Admin
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (
      !loading &&
      isAuthenticated &&
      user?.role !== "ADMIN" &&
      user?.role !== "HR_MANAGER"
    ) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    if (
      resolvedParams &&
      isAuthenticated &&
      (user?.role === "ADMIN" || user?.role === "HR_MANAGER")
    ) {
      fetchApplicationDetails();
    }
  }, [isAuthenticated, user, resolvedParams]);

  const fetchApplicationDetails = async () => {
    if (!resolvedParams) return;

    try {
      const token = localStorage.getItem("hr-auth-token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch application details
      const applicationRes = await fetch(
        `/api/careers/applications/${resolvedParams.id}`,
        { headers }
      );

      if (!applicationRes.ok) {
        if (applicationRes.status === 404) {
          setError("Application not found");
        } else {
          setError("Failed to load application details");
        }
        return;
      }

      const applicationData = await applicationRes.json();
      setApplication(applicationData.application);

      // Fetch interviews for this application
      const interviewsRes = await fetch("/api/interviews", { headers });
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        const applicationInterviews =
          interviewsData.interviews?.filter(
            (i: Interview & { applicationId: string }) =>
              i.applicationId === resolvedParams.id
          ) || [];
        setInterviews(applicationInterviews);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setError("Failed to load application details");
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-green-100 text-green-800";
      case "HIRED":
        return "bg-green-200 text-green-900";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;

    try {
      const token = localStorage.getItem("hr-auth-token");
      const response = await fetch(
        `/api/careers/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setApplication({ ...application, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <button
            onClick={() => router.push("/recruitment")}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Application not found
          </h1>
          <button
            onClick={() => router.push("/recruitment")}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/recruitment")}
                className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Recruitment
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <User className="h-8 w-8 mr-3 text-blue-600" />
                  Application Details
                </h1>
                <p className="text-gray-600">
                  {application.candidateName} - {application.job.title}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={application.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                title="Update application status"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFERED">Offered</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Application Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Application Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Application Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Candidate Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {application.candidateName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {application.candidateEmail}
                      </span>
                    </div>
                    {application.candidatePhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {application.candidatePhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Position Details
                  </h3>
                  <div className="space-y-2">
                    <div className="text-gray-900 font-medium">
                      {application.job.title}
                    </div>
                    <div className="text-gray-600">
                      {application.job.department}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {application.job.location}
                    </div>
                    <div className="text-gray-600">
                      {application.job.employmentType}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Application Status
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Applied on{" "}
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Documents
                  </h3>
                  <div className="space-y-2">
                    {application.resumeUrl ? (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Resume
                      </a>
                    ) : (
                      <span className="text-gray-500">No resume uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cover Letter
              </h2>
              <div className="prose max-w-none">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {application.job.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Internal Notes
                </h2>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    router.push(`/careers/jobs/${application.job.id}`)
                  }
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  View Job Posting
                </button>
                <button
                  onClick={() => router.push("/interviews/schedule")}
                  className="w-full text-left px-3 py-2 text-green-600 hover:bg-green-50 rounded"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => router.push("/recruitment")}
                  className="w-full text-left px-3 py-2 text-purple-600 hover:bg-purple-50 rounded"
                >
                  Back to Applications
                </button>
              </div>
            </div>

            {/* Interview History */}
            {interviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Interview History
                </h3>
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="border-l-4 border-blue-500 pl-3"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {interview.interviewType} Interview
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(interview.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            interview.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : interview.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {interview.status}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/interviews/${interview.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Application Submitted
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {application.status !== "SUBMITTED" && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Status: {application.status}
                      </div>
                      <div className="text-sm text-gray-500">
                        Current status
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

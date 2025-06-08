"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Download,
  Eye,
  Mail,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
}

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter: string;
  resumeUrl?: string;
  status: string;
  appliedDate: string;
  notes?: string;
}

export default function JobApplicationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch job and applications data
  useEffect(() => {
    if (jobId && isAuthenticated) {
      fetchJobAndApplications();
    }
  }, [jobId, isAuthenticated]);

  const fetchJobAndApplications = async () => {
    try {
      // Fetch job details and applications in parallel
      const [jobResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/jobs/${jobId}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`/api/jobs/${jobId}/applications`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData.job);
      }

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });

      if (response.ok) {
        // Refresh applications
        fetchJobAndApplications();
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

  if (!isAuthenticated || !job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push("/jobs")}
              className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Jobs
            </button>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Applications for {job.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {job.department} • {job.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      New Applications
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        applications.filter((app) => app.status === "SUBMITTED")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      In Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        applications.filter(
                          (app) =>
                            app.status === "REVIEWED" ||
                            app.status === "INTERVIEW"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        applications.filter((app) => app.status === "ACCEPTED")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No applications yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Applications will appear here once candidates start applying.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.candidateName}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {application.candidateEmail}
                          </div>
                          {application.candidatePhone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {application.candidatePhone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <div className="text-sm text-gray-700">
                              <p className="font-medium text-gray-900">
                                Applied:{" "}
                                {new Date(
                                  application.appliedDate
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600">
                                Email: {application.candidateEmail}
                              </p>
                              <p className="text-gray-600">
                                Phone:{" "}
                                {application.candidatePhone || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Cover Letter
                          </h4>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {application.coverLetter}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                            {application.resumeUrl && (
                              <a
                                href={application.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Resume
                              </a>
                            )}
                          </div>

                          {(user?.role === "ADMIN" ||
                            user?.role === "HR_MANAGER") && (
                            <div className="flex space-x-2">
                              <select
                                value={application.status}
                                onChange={(e) =>
                                  updateApplicationStatus(
                                    application.id,
                                    e.target.value
                                  )
                                }
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                aria-label="Update application status"
                              >
                                <option value="SUBMITTED">Submitted</option>
                                <option value="REVIEWED">Reviewed</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Candidate Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Candidate Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedApplication.candidateName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {selectedApplication.candidateEmail}
                    </p>
                  </div>
                  {selectedApplication.candidatePhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedApplication.candidatePhone}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Application Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        selectedApplication.appliedDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Cover Letter
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Resume
                  </h4>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </div>
              )}

              {/* Status and Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Status
                </h4>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status}
                  </span>

                  {(user?.role === "ADMIN" || user?.role === "HR_MANAGER") && (
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => {
                        updateApplicationStatus(
                          selectedApplication.id,
                          e.target.value
                        );
                        setSelectedApplication(null);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      aria-label="Change application status"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

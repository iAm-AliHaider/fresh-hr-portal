"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Search,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter: string;
  resumeUrl?: string;
  status: string;
  appliedDate: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
  interviews?: Interview[];
}

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  scheduledDate: string;
  interviewType: string;
  status: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
}

interface Job {
  id: string;
  title: string;
  department: string;
  status: string;
  _count: {
    applications: number;
  };
}

export default function RecruitmentPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    applicationId: "",
    scheduledDate: "",
    interviewType: "VIDEO",
    duration: 60,
    location: "",
    meetingLink: "",
    notes: "",
  });

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
      isAuthenticated &&
      (user?.role === "ADMIN" || user?.role === "HR_MANAGER")
    ) {
      fetchRecruitmentData();
    }
  }, [isAuthenticated, user]);

  const fetchRecruitmentData = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch applications
      const applicationsRes = await fetch("/api/careers/applications", {
        headers,
      });
      const applicationsData = await applicationsRes.json();

      // Fetch interviews
      const interviewsRes = await fetch("/api/interviews", { headers });
      const interviewsData = await interviewsRes.json();

      // Fetch jobs
      const jobsRes = await fetch("/api/jobs", { headers });
      const jobsData = await jobsRes.json();

      setApplications(applicationsData.applications || []);
      setInterviews(interviewsData.interviews || []);
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error("Error fetching recruitment data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      const response = await fetch(
        `/api/careers/applications/${applicationId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchRecruitmentData();
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const scheduleInterview = async () => {
    try {
      const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...interviewData,
          candidateName: selectedApplication?.candidateName,
          candidateEmail: selectedApplication?.candidateEmail,
          jobId: selectedApplication?.job.id,
        }),
      });

      if (response.ok) {
        setShowInterviewModal(false);
        setInterviewData({
          applicationId: "",
          scheduledDate: "",
          interviewType: "VIDEO",
          duration: 60,
          location: "",
          meetingLink: "",
          notes: "",
        });
        fetchRecruitmentData();
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
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
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (user?.role !== "ADMIN" && user?.role !== "HR_MANAGER")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only HR Managers and Administrators can access the recruitment
            module.
          </p>
        </div>
      </div>
    );
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayInterviews = interviews.filter(
    (interview) =>
      new Date(interview.scheduledDate).toDateString() ===
      new Date().toDateString()
  );

  const stats = {
    totalApplications: applications.length,
    newApplications: applications.filter((app) => app.status === "SUBMITTED")
      .length,
    interviewsToday: todayInterviews.length,
    pendingOffers: applications.filter((app) => app.status === "OFFERED")
      .length,
    totalHired: applications.filter((app) => app.status === "HIRED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="h-8 w-8 mr-3 text-blue-600" />
                  Recruitment Management
                </h1>
                <p className="text-gray-600">
                  Manage applications, interviews, and hiring pipeline
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push("/interviews")}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                title="Go to interviews management"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Interviews
              </button>
              <button
                onClick={() => router.push("/offers")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                title="Go to offers management"
              >
                <FileText className="h-4 w-4 mr-2" />
                Offers
              </button>
              <button
                onClick={() => router.push("/jobs")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                title="Go to jobs management"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Jobs
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  New Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.newApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Interviews Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.interviewsToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Offers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHired}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                {
                  id: "pipeline",
                  label: "Application Pipeline",
                  icon: FileText,
                },
                { id: "interviews", label: "Interviews", icon: Calendar },
                { id: "today", label: "Today's Schedule", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <label htmlFor="search-input" className="sr-only">
                  Search candidates, positions, or emails
                </label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search candidates, positions, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                title="Filter applications by status"
              >
                <option value="all">All Statuses</option>
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

        {/* Content based on active tab */}
        {activeTab === "pipeline" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Application Pipeline
              </h2>

              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-8 w-8 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.candidateName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.candidateEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {application.job.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.job.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              application.appliedDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApplicationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View application details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {application.status === "REVIEWED" && (
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setInterviewData({
                                    ...interviewData,
                                    applicationId: application.id,
                                  });
                                  setShowInterviewModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Schedule interview"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                            )}
                            <div className="relative inline-block">
                              <label
                                htmlFor={`status-${application.id}`}
                                className="sr-only"
                              >
                                Update application status
                              </label>
                              <select
                                id={`status-${application.id}`}
                                value={application.status}
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    application.id,
                                    e.target.value
                                  )
                                }
                                className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black"
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All Interviews
              </h2>

              {interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No interviews scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {interview.candidateName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {interview.candidateEmail}
                          </p>
                          <p className="text-sm text-gray-600">
                            {interview.job.title} - {interview.job.department}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(
                                interview.scheduledDate
                              ).toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {interview.interviewType}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/interviews/${interview.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="View interview details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Open chat with candidate"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "today" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Schedule
              </h2>

              {todayInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No interviews scheduled for today
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {interview.candidateName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {interview.job.title} - {interview.job.department}
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            {new Date(
                              interview.scheduledDate
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Join Interview
                          </button>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            title="Open chat with candidate"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Application Details
              </h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  Candidate Information
                </h4>
                <p className="text-gray-600">
                  Name: {selectedApplication.candidateName}
                </p>
                <p className="text-gray-600">
                  Email: {selectedApplication.candidateEmail}
                </p>
                {selectedApplication.candidatePhone && (
                  <p className="text-gray-600">
                    Phone: {selectedApplication.candidatePhone}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Position</h4>
                <p className="text-gray-600">{selectedApplication.job.title}</p>
                <p className="text-gray-600">
                  {selectedApplication.job.department}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Cover Letter</h4>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto">
                  {selectedApplication.coverLetter}
                </div>
              </div>

              {selectedApplication.resumeUrl && (
                <div>
                  <h4 className="font-medium text-gray-900">Resume</h4>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Resume
                  </a>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedApplication.status === "SUBMITTED" && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, "REVIEWED");
                      setShowApplicationModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule Interview
              </h3>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600">
                  Candidate: {selectedApplication.candidateName}
                </p>
                <p className="text-gray-600">
                  Position: {selectedApplication.job.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={interviewData.scheduledDate}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      scheduledDate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  title="Select interview date and time"
                  placeholder="Select date and time"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Type
                </label>
                <select
                  value={interviewData.interviewType}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      interviewType: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  title="Select interview type"
                >
                  <option value="VIDEO">Video Call</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="IN_PERSON">In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={interviewData.duration}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  min="15"
                  max="180"
                  title="Interview duration in minutes"
                  placeholder="60"
                />
              </div>

              {interviewData.interviewType === "VIDEO" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={interviewData.meetingLink}
                    onChange={(e) =>
                      setInterviewData({
                        ...interviewData,
                        meetingLink: e.target.value,
                      })
                    }
                    placeholder="https://meet.google.com/..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              )}

              {interviewData.interviewType === "IN_PERSON" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={interviewData.location}
                    onChange={(e) =>
                      setInterviewData({
                        ...interviewData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Conference Room A, 123 Main St..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={interviewData.notes}
                  onChange={(e) =>
                    setInterviewData({
                      ...interviewData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Interview agenda, specific topics to cover..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleInterview}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

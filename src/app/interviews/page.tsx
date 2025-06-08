"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Search,
  Star,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  scheduledDate: string;
  duration: number;
  interviewType: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
  application?: {
    id: string;
    status: string;
  };
}

interface Assessment {
  id: string;
  interviewId: string;
  technicalSkills: number;
  communication: number;
  culturalFit: number;
  overallRating: number;
  strengths: string;
  weaknesses: string;
  recommendation: string;
  additionalNotes: string;
  createdAt: string;
}

export default function InterviewsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("scheduled");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      message: string;
      timestamp: string;
    }>
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [assessmentData, setAssessmentData] = useState({
    technicalSkills: 5,
    communication: 5,
    culturalFit: 5,
    overallRating: 5,
    strengths: "",
    weaknesses: "",
    recommendation: "NEUTRAL",
    additionalNotes: "",
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
      fetchInterviewData();
    }
  }, [isAuthenticated, user]);

  const fetchInterviewData = async () => {
    try {
      const response = await fetch("/api/interviews", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
        setAssessments(data.assessments || []);
      } else {
        console.error("Failed to fetch interviews");
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInterviewComplete = async (interviewId: string) => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        fetchInterviewData();
      }
    } catch (error) {
      console.error("Error updating interview status:", error);
    }
  };

  const submitAssessment = async () => {
    if (!selectedInterview) return;

    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: selectedInterview.id,
          ...assessmentData,
        }),
      });

      if (response.ok) {
        setShowAssessmentModal(false);
        setAssessmentData({
          technicalSkills: 5,
          communication: 5,
          culturalFit: 5,
          overallRating: 5,
          strengths: "",
          weaknesses: "",
          recommendation: "NEUTRAL",
          additionalNotes: "",
        });
        fetchInterviewData();
        alert("Assessment submitted successfully!");
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert("An assessment already exists for this interview. Please refresh the page to see the existing assessment.");
        setShowAssessmentModal(false);
        fetchInterviewData(); // Refresh to show existing assessment
      } else {
        const errorData = await response.json();
        alert(`Failed to submit assessment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("An error occurred while submitting the assessment. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "PHONE":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleChatOpen = (interview: Interview) => {
    setSelectedInterview(interview);
    // Mock chat messages - in real app, fetch from API
    setChatMessages([
      {
        id: "1",
        sender: "HR",
        message: `Hi ${
          interview.candidateName
        }, your interview is scheduled for ${new Date(
          interview.scheduledDate
        ).toLocaleString()}. Please let us know if you have any questions!`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowChatModal(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedInterview) return;

    const message = {
      id: Date.now().toString(),
      sender: "HR",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");

    // In real app, send to API
    console.log("Sending message:", message);
  };

  const handleJoinInterview = (interview: Interview) => {
    // Handle different interview types
    if (interview.interviewType === "VIDEO" && interview.meetingLink) {
      window.open(interview.meetingLink, "_blank");
    } else if (interview.interviewType === "PHONE") {
      alert(`Please call the candidate at: ${interview.candidateEmail}`);
    } else {
      alert(`In-person interview at: ${interview.location || "TBD"}`);
    }

    // Update interview status to IN_PROGRESS
    handleInterviewStatusUpdate(interview.id, "IN_PROGRESS");
  };

  const handleInterviewStatusUpdate = async (
    interviewId: string,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchInterviewData();
      }
    } catch (error) {
      console.error("Error updating interview status:", error);
    }
  };

  const handleCandidateInfo = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowCandidateModal(true);
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
            Only HR Managers and Administrators can access interview management.
          </p>
        </div>
      </div>
    );
  }

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.candidateEmail
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.job.title.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case "scheduled":
        return matchesSearch && interview.status === "SCHEDULED";
      case "completed":
        return matchesSearch && interview.status === "COMPLETED";
      case "today":
        return (
          matchesSearch &&
          new Date(interview.scheduledDate).toDateString() ===
            new Date().toDateString()
        );
      default:
        return matchesSearch;
    }
  });

  const todayInterviews = interviews.filter(
    (interview) =>
      new Date(interview.scheduledDate).toDateString() ===
      new Date().toDateString()
  );

  const stats = {
    totalInterviews: interviews.length,
    scheduledInterviews: interviews.filter((i) => i.status === "SCHEDULED")
      .length,
    completedInterviews: interviews.filter((i) => i.status === "COMPLETED")
      .length,
    todayInterviews: todayInterviews.length,
    assessmentsCompleted: assessments.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/recruitment")}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back to Recruitment
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar className="h-8 w-8 mr-3 text-purple-600" />
                  Interview Management
                </h1>
                <p className="text-gray-600">
                  Schedule interviews, conduct assessments, and track progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Interviews
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.scheduledInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayInterviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assessments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.assessmentsCompleted}
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
                { id: "scheduled", label: "Scheduled Interviews", icon: Clock },
                { id: "today", label: "Today's Interviews", icon: Calendar },
                { id: "completed", label: "Completed", icon: CheckCircle },
                { id: "assessments", label: "Assessments", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
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

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="relative">
            <label htmlFor="interview-search" className="sr-only">
              Search interviews
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="interview-search"
              type="text"
              placeholder="Search by candidate, position, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-black"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {(activeTab === "scheduled" ||
          activeTab === "today" ||
          activeTab === "completed") && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === "scheduled" && "Scheduled Interviews"}
                {activeTab === "today" && "Today's Interviews"}
                {activeTab === "completed" && "Completed Interviews"}
              </h2>

              {filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No interviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="h-6 w-6 text-gray-400 mr-3" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {interview.candidateName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {interview.candidateEmail}
                              </p>
                            </div>
                          </div>

                          <div className="ml-9 space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Position:</span>{" "}
                              {interview.job.title} - {interview.job.department}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(
                                  interview.scheduledDate
                                ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(
                                  interview.scheduledDate
                                ).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center">
                                {getInterviewTypeIcon(interview.interviewType)}
                                <span className="ml-1">
                                  {interview.interviewType}
                                </span>
                              </span>
                              <span className="flex items-center">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    interview.status
                                  )}`}
                                >
                                  {interview.status}
                                </span>
                              </span>
                            </div>

                            {interview.notes && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span>{" "}
                                {interview.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {(interview.status === "SCHEDULED" ||
                            interview.status === "IN_PROGRESS") && (
                            <button
                              onClick={() =>
                                handleInterviewComplete(interview.id)
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Mark Complete
                            </button>
                          )}

                          {interview.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleJoinInterview(interview)}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                            >
                              Join Interview
                            </button>
                          )}

                          {interview.status === "COMPLETED" &&
                            !assessments.find(
                              (a) => a.interviewId === interview.id
                            ) && (
                              <button
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setShowAssessmentModal(true);
                                }}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                              >
                                Add Assessment
                              </button>
                            )}

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
                              onClick={() => handleCandidateInfo(interview)}
                              className="text-green-600 hover:text-green-900"
                              title="View candidate information"
                            >
                              <User className="h-4 w-4" />
                            </button>
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              title="Open chat with candidate"
                              onClick={() => handleChatOpen(interview)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "assessments" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Interview Assessments
              </h2>

              {assessments.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assessments completed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => {
                    const interview = interviews.find(
                      (i) => i.id === assessment.interviewId
                    );
                    return (
                      <div
                        key={assessment.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {interview?.candidateName || "Unknown Candidate"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {interview?.job.title} -{" "}
                              {interview?.job.department}
                            </p>
                            <p className="text-sm text-gray-500">
                              Assessed on{" "}
                              {new Date(
                                assessment.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              Overall: {assessment.overallRating}/10
                            </div>
                            <div className="text-sm text-gray-600">
                              Recommendation:{" "}
                              <span className="font-medium">
                                {assessment.recommendation}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {assessment.technicalSkills}/10
                            </div>
                            <div className="text-sm text-gray-600">
                              Technical Skills
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {assessment.communication}/10
                            </div>
                            <div className="text-sm text-gray-600">
                              Communication
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                              {assessment.culturalFit}/10
                            </div>
                            <div className="text-sm text-gray-600">
                              Cultural Fit
                            </div>
                          </div>
                        </div>

                        {(assessment.strengths || assessment.weaknesses) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {assessment.strengths && (
                              <div>
                                <div className="font-medium text-green-700 mb-1">
                                  Strengths:
                                </div>
                                <div className="text-gray-600">
                                  {assessment.strengths}
                                </div>
                              </div>
                            )}
                            {assessment.weaknesses && (
                              <div>
                                <div className="font-medium text-red-700 mb-1">
                                  Areas for Improvement:
                                </div>
                                <div className="text-gray-600">
                                  {assessment.weaknesses}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && selectedInterview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Interview Assessment
              </h3>
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close assessment modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600">
                  Candidate: {selectedInterview.candidateName}
                </p>
                <p className="text-gray-600">
                  Position: {selectedInterview.job.title}
                </p>
              </div>

              {/* Rating Scales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Skills (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessmentData.technicalSkills}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        technicalSkills: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                    title="Rate technical skills from 1 to 10"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {assessmentData.technicalSkills}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessmentData.communication}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        communication: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                    title="Rate communication skills from 1 to 10"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {assessmentData.communication}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Fit (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessmentData.culturalFit}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        culturalFit: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                    title="Rate cultural fit from 1 to 10"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {assessmentData.culturalFit}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessmentData.overallRating}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        overallRating: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                    title="Rate overall performance from 1 to 10"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {assessmentData.overallRating}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendation
                </label>
                <select
                  value={assessmentData.recommendation}
                  onChange={(e) =>
                    setAssessmentData({
                      ...assessmentData,
                      recommendation: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  title="Select recommendation for this candidate"
                >
                  <option value="STRONG_HIRE">Strong Hire</option>
                  <option value="HIRE">Hire</option>
                  <option value="NO_HIRE">No Hire</option>
                  <option value="STRONG_NO_HIRE">Strong No Hire</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths
                  </label>
                  <textarea
                    value={assessmentData.strengths}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        strengths: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Key strengths observed..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Areas for Improvement
                  </label>
                  <textarea
                    value={assessmentData.weaknesses}
                    onChange={(e) =>
                      setAssessmentData({
                        ...assessmentData,
                        weaknesses: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Areas that need development..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={assessmentData.additionalNotes}
                  onChange={(e) =>
                    setAssessmentData({
                      ...assessmentData,
                      additionalNotes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Any additional observations or comments..."
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAssessment}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedInterview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Chat with {selectedInterview.candidateName}
              </h3>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close chat"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-80 border border-gray-300 rounded-lg p-4 overflow-y-auto bg-gray-50">
                {chatMessages.map((message) => (
                  <div key={message.id} className="mb-3">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-gray-900">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Portal Modal */}
      {showCandidateModal && selectedInterview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Candidate Information
              </h3>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close candidate info"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedInterview.candidateName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedInterview.candidateEmail}
                    </div>
                    <div>
                      <span className="font-medium">Position:</span>{" "}
                      {selectedInterview.job.title}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {selectedInterview.job.department}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Interview Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedInterview.interviewType}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(
                        selectedInterview.scheduledDate
                      ).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedInterview.duration} minutes
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedInterview.status
                        )}`}
                      >
                        {selectedInterview.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInterview.notes && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Interview Notes
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedInterview.notes}
                  </div>
                </div>
              )}

              {selectedInterview.meetingLink && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Meeting Link
                  </h4>
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {selectedInterview.meetingLink}
                  </a>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleJoinInterview(selectedInterview)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Join Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

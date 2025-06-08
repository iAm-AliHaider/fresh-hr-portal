"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  User,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  application: {
    id: string;
    status: string;
    candidateName: string;
    candidateEmail: string;
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

interface InterviewDetailPageProps {
  params: { id: string };
}

export default function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
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
      fetchInterviewDetails();
    }
  }, [isAuthenticated, user, resolvedParams]);

  const fetchInterviewDetails = async () => {
    if (!resolvedParams) return;

    try {
      const token = localStorage.getItem("hr-auth-token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch interview details
      const interviewRes = await fetch(`/api/interviews/${resolvedParams.id}`, {
        headers,
      });

      if (!interviewRes.ok) {
        if (interviewRes.status === 404) {
          setError("Interview not found");
        } else {
          setError("Failed to load interview details");
        }
        return;
      }

      const interviewData = await interviewRes.json();
      setInterview(interviewData.interview);

      // Fetch assessment if it exists
      const assessmentsRes = await fetch("/api/assessments", { headers });
      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json();
        const interviewAssessment = assessmentsData.assessments?.find(
          (a: Assessment) => a.interviewId === resolvedParams.id
        );
        if (interviewAssessment) {
          setAssessment(interviewAssessment);
        }
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      setError("Failed to load interview details");
    } finally {
      setLoadingData(false);
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
        return <Video className="h-5 w-5" />;
      case "PHONE":
        return <MessageSquare className="h-5 w-5" />;
      case "IN_PERSON":
        return <MapPin className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const handleJoinInterview = () => {
    if (!interview) return;

    if (interview.interviewType === "VIDEO" && interview.meetingLink) {
      window.open(interview.meetingLink, "_blank");
    } else if (interview.interviewType === "PHONE") {
      alert(`Please call the candidate at: ${interview.candidateEmail}`);
    } else {
      alert(`In-person interview at: ${interview.location || "TBD"}`);
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
            onClick={() => router.push("/interviews")}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Interview not found
          </h1>
          <button
            onClick={() => router.push("/interviews")}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Interviews
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
                onClick={() => router.push("/interviews")}
                className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Interviews
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar className="h-8 w-8 mr-3 text-purple-600" />
                  Interview Details
                </h1>
                <p className="text-gray-600">
                  {interview.candidateName} - {interview.job.title}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {interview.status === "SCHEDULED" && (
                <button
                  onClick={handleJoinInterview}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
                >
                  {getInterviewTypeIcon(interview.interviewType)}
                  <span className="ml-2">Join Interview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interview Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Interview Overview
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
                        {interview.candidateName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {interview.candidateEmail}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Position Details
                  </h3>
                  <div className="space-y-2">
                    <div className="text-gray-900 font-medium">
                      {interview.job.title}
                    </div>
                    <div className="text-gray-600">
                      {interview.job.department}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Interview Schedule
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(interview.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(interview.scheduledDate).toLocaleTimeString()}{" "}
                        ({interview.duration} min)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Interview Type & Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {getInterviewTypeIcon(interview.interviewType)}
                      <span className="text-gray-900 ml-2">
                        {interview.interviewType}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {interview.meetingLink && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </h3>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {interview.meetingLink}
                  </a>
                </div>
              )}

              {interview.location && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Location
                  </h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{interview.location}</span>
                  </div>
                </div>
              )}

              {interview.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Interview Notes
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{interview.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Results */}
            {assessment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Star className="h-6 w-6 text-orange-500 mr-2" />
                  Assessment Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {assessment.technicalSkills}/10
                    </div>
                    <div className="text-sm text-gray-600">
                      Technical Skills
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {assessment.communication}/10
                    </div>
                    <div className="text-sm text-gray-600">Communication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {assessment.culturalFit}/10
                    </div>
                    <div className="text-sm text-gray-600">Cultural Fit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {assessment.overallRating}/10
                    </div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Recommendation
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">
                      {assessment.recommendation.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {(assessment.strengths || assessment.weaknesses) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {assessment.strengths && (
                      <div>
                        <h3 className="text-sm font-medium text-green-700 mb-2">
                          Strengths
                        </h3>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-gray-900">
                            {assessment.strengths}
                          </p>
                        </div>
                      </div>
                    )}
                    {assessment.weaknesses && (
                      <div>
                        <h3 className="text-sm font-medium text-red-700 mb-2">
                          Areas for Improvement
                        </h3>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-gray-900">
                            {assessment.weaknesses}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {assessment.additionalNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {assessment.additionalNotes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  Assessment completed on{" "}
                  {new Date(assessment.createdAt).toLocaleDateString()}
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
                    router.push(`/careers/apply?jobId=${interview.job.id}`)
                  }
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  View Job Posting
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/recruitment?applicationId=${interview.application.id}`
                    )
                  }
                  className="w-full text-left px-3 py-2 text-green-600 hover:bg-green-50 rounded"
                >
                  View Application
                </button>
                <button
                  onClick={() => router.push("/interviews")}
                  className="w-full text-left px-3 py-2 text-purple-600 hover:bg-purple-50 rounded"
                >
                  Back to All Interviews
                </button>
              </div>
            </div>

            {/* Interview Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interview Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Interview Scheduled
                    </div>
                    <div className="text-sm text-gray-500">
                      For{" "}
                      {new Date(interview.scheduledDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {interview.status === "COMPLETED" && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Interview Completed
                      </div>
                      <div className="text-sm text-gray-500">
                        Status updated to completed
                      </div>
                    </div>
                  </div>
                )}

                {assessment && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Assessment Completed
                      </div>
                      <div className="text-sm text-gray-500">
                        Overall rating: {assessment.overallRating}/10
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

"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Save,
  Users,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  status: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
}

export default function ScheduleInterviewPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    applicationId: "",
    jobId: "",
    candidateName: "",
    candidateEmail: "",
    interviewType: "VIDEO",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    location: "",
    meetingLink: "",
    notes: "",
  });

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
    if (
      !loading &&
      isAuthenticated &&
      user?.role !== "ADMIN" &&
      user?.role !== "HR_MANAGER"
    ) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router, user]);

  // Fetch applications that are in REVIEWED status
  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("hr-auth-token");
      const response = await fetch("/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const jobs = data.jobs || [];

        // Flatten applications from all jobs
        const allApplications: Application[] = [];
        for (const job of jobs) {
          if (job.applications) {
            for (const app of job.applications) {
              allApplications.push({
                ...app,
                job: {
                  id: job.id,
                  title: job.title,
                  department: job.department,
                },
              });
            }
          }
        }

        // Filter for REVIEWED status applications
        const reviewedApplications = allApplications.filter(
          (app) => app.status === "REVIEWED"
        );
        setApplications(reviewedApplications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApplicationSelect = (applicationId: string) => {
    const selectedApp = applications.find((app) => app.id === applicationId);
    if (selectedApp) {
      setFormData({
        ...formData,
        applicationId: selectedApp.id,
        jobId: selectedApp.job.id,
        candidateName: selectedApp.candidateName,
        candidateEmail: selectedApp.candidateEmail,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("hr-auth-token");

      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: formData.applicationId,
          jobId: formData.jobId,
          candidateName: formData.candidateName,
          candidateEmail: formData.candidateEmail,
          interviewType: formData.interviewType,
          scheduledDate: scheduledDateTime.toISOString(),
          duration: formData.duration,
          location: formData.location || null,
          meetingLink: formData.meetingLink || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        router.push("/interviews");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingApplications) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push("/interviews")}
              className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Interviews
            </button>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Schedule Interview
                </h1>
                <p className="text-sm text-gray-600">
                  Schedule a new interview for a candidate
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No applications ready for interview
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Applications need to be in &quot;REVIEWED&quot; status to
                schedule interviews.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/jobs")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Review Applications
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Interview Details
                  </h3>
                </div>

                <div className="px-6 py-6 space-y-6">
                  {/* Application Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Candidate *
                    </label>
                    <select
                      value={formData.applicationId}
                      onChange={(e) => handleApplicationSelect(e.target.value)}
                      required
                      aria-label="Select candidate for interview"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                    >
                      <option value="">Choose a candidate...</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.candidateName} - {app.job.title} (
                          {app.job.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.applicationId && (
                    <>
                      {/* Interview Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Type *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            {
                              value: "VIDEO",
                              label: "Video Call",
                              icon: Video,
                              color: "blue",
                            },
                            {
                              value: "PHONE",
                              label: "Phone Call",
                              icon: Phone,
                              color: "green",
                            },
                            {
                              value: "IN_PERSON",
                              label: "In Person",
                              icon: MapPin,
                              color: "purple",
                            },
                            {
                              value: "PANEL",
                              label: "Panel Interview",
                              icon: Users,
                              color: "red",
                            },
                          ].map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    interviewType: type.value,
                                  })
                                }
                                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                                  formData.interviewType === type.value
                                    ? `border-${type.color}-500 bg-${type.color}-50`
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <IconComponent
                                  className={`h-6 w-6 ${
                                    formData.interviewType === type.value
                                      ? `text-${type.color}-600`
                                      : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    formData.interviewType === type.value
                                      ? `text-${type.color}-900`
                                      : "text-gray-700"
                                  }`}
                                >
                                  {type.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                          </label>
                          <input
                            type="datetime-local"
                            id="scheduledDate"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledDate: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time *
                          </label>
                          <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledTime: e.target.value,
                              })
                            }
                            required
                            aria-label="Interview time"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          />
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value),
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          min="15"
                          max="240"
                          required
                        />
                      </div>

                      {/* Location (for in-person) */}
                      {formData.interviewType === "IN_PERSON" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Conference Room A, 123 Main St, etc."
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          />
                        </div>
                      )}

                      {/* Meeting Link (for video) */}
                      {formData.interviewType === "VIDEO" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Link
                          </label>
                          <input
                            type="url"
                            id="meetingLink"
                            name="meetingLink"
                            value={formData.meetingLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                meetingLink: e.target.value,
                              })
                            }
                            placeholder="https://meet.google.com/..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          />
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          rows={4}
                          placeholder="Interview agenda, specific topics to cover, etc."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      </div>
                    </>
                  )}
                </div>

                {formData.applicationId && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.push("/interviews")}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

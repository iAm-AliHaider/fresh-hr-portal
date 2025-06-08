"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Save,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string;
  benefits?: string;
  status: string;
  postedDate: string;
  closingDate?: string;
}

export default function EditJobPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    employmentType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    requirements: "",
    benefits: "",
    status: "OPEN",
    closingDate: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Check permissions
  useEffect(() => {
    if (user && user.userType === "CANDIDATE") {
      // Only block candidates from editing jobs
      router.push("/candidate/portal");
    }
  }, [user, router]);

  // Fetch job data
  useEffect(() => {
    if (jobId && isAuthenticated) {
      fetchJob();
    }
  }, [jobId, isAuthenticated]);

  const fetchJob = async () => {
    try {
      // Get token from the correct localStorage key
      let token = null;
      const employeeAuth = localStorage.getItem("employeeAuth");
      const legacyToken = localStorage.getItem("hr-auth-token");
      
      if (employeeAuth) {
        const authData = JSON.parse(employeeAuth);
        token = authData.token;
      } else if (legacyToken) {
        token = legacyToken;
      }

      console.log("Job Edit - Fetching job with token:", token ? "Present" : "Missing");
      
      if (!token) {
        console.error("Job Edit - No authentication token found");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("Job Edit - API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Job Edit - Job data received:", !!data.job);
        const jobData = data.job;
        setJob(jobData);
        setFormData({
          title: jobData.title || "",
          description: jobData.description || "",
          department: jobData.department || "",
          location: jobData.location || "",
          employmentType: jobData.employmentType || "FULL_TIME",
          salaryMin: jobData.salaryMin?.toString() || "",
          salaryMax: jobData.salaryMax?.toString() || "",
          requirements: jobData.requirements || "",
          benefits: jobData.benefits || "",
          status: jobData.status || "OPEN",
          closingDate: jobData.closingDate
            ? new Date(jobData.closingDate).toISOString().split("T")[0]
            : "",
        });
      } else if (response.status === 404) {
        console.log("Job Edit - Job not found, redirecting to jobs list");
        router.push("/jobs");
      } else if (response.status === 401) {
        console.log("Job Edit - Unauthorized, redirecting to login");
        localStorage.removeItem("employeeAuth");
        localStorage.removeItem("hr-auth-token");
        router.push("/login");
      } else {
        console.error("Job Edit - Failed to fetch job, status:", response.status);
        const errorText = await response.text();
        console.error("Job Edit - Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoadingJob(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.employmentType.trim()) {
      newErrors.employmentType = "Employment type is required";
    }

    // Salary validation - Allow empty values
    if (formData.salaryMin && formData.salaryMax) {
      const min = parseFloat(formData.salaryMin);
      const max = parseFloat(formData.salaryMax);
      
      if (isNaN(min)) {
        newErrors.salaryMin = "Invalid minimum salary";
      }
      if (isNaN(max)) {
        newErrors.salaryMax = "Invalid maximum salary";
      }
      if (!isNaN(min) && !isNaN(max) && min >= max) {
        newErrors.salaryMax = "Maximum salary must be higher than minimum";
      }
    } else if (formData.salaryMin && isNaN(parseFloat(formData.salaryMin))) {
      newErrors.salaryMin = "Invalid minimum salary";
    } else if (formData.salaryMax && isNaN(parseFloat(formData.salaryMax))) {
      newErrors.salaryMax = "Invalid maximum salary";
    }

    // Closing date validation
    if (formData.closingDate) {
      const closingDate = new Date(formData.closingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (closingDate < today) {
        newErrors.closingDate = "Closing date cannot be in the past";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setErrors({}); // Clear previous errors

    try {
      // Get token from the correct localStorage key
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
        setErrors({ submit: "Authentication token missing. Please login again." });
        router.push("/login");
        return;
      }

      // Prepare the data
      const updateData = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        closingDate: formData.closingDate || null,
      };

      console.log("Job Edit - Updating job with data:", updateData);
      console.log("Job Edit - Using token:", token ? "Present" : "Missing");

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("Job Edit - Update response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Job Edit - Job updated successfully:", result);
        router.push("/jobs");
      } else if (response.status === 401) {
        console.log("Job Edit - Unauthorized during update, redirecting to login");
        localStorage.removeItem("employeeAuth");
        localStorage.removeItem("hr-auth-token");
        router.push("/login");
      } else {
        const errorData = await response.json();
        console.error("Job Edit - Update failed:", errorData);
        setErrors({ submit: errorData.error || `Failed to update job (${response.status})` });
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push("/jobs")}
              className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Jobs
            </button>
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                Edit Job
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Job Posting
            </h1>
            <p className="text-gray-600 mt-1">Update the job details below</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      errors.title
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    } text-black`}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      errors.department
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    } text-black`}
                    placeholder="e.g. Engineering"
                  />
                </div>
                {errors.department && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      errors.location
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    } text-black`}
                    placeholder="e.g. New York, NY / Remote"
                  />
                </div>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Employment Type */}
              <div>
                <label
                  htmlFor="employmentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Employment Type *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      errors.employmentType
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    } text-black`}
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                {errors.employmentType && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.employmentType}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    placeholder="Minimum salary"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    placeholder="Maximum salary"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      errors.salaryMax
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    } text-black`}
                  />
                </div>
              </div>
              {errors.salaryMax && (
                <p className="mt-2 text-sm text-red-600">{errors.salaryMax}</p>
              )}
            </div>

            {/* Closing Date */}
            <div>
              <label
                htmlFor="closingDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Application Closing Date (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="closingDate"
                  name="closingDate"
                  value={formData.closingDate}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Job Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                    errors.description
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } text-black`}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                />
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Requirements & Qualifications
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
                placeholder="List the required skills, experience, education, etc."
              />
            </div>

            {/* Benefits */}
            <div>
              <label
                htmlFor="benefits"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Benefits & Perks
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                value={formData.benefits}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-black"
                placeholder="Describe the benefits, perks, and what makes your company great..."
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

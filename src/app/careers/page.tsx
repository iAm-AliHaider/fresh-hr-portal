"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  _count?: {
    applications: number;
  };
}

export default function CareersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch public job postings
  useEffect(() => {
    fetchPublicJobs();
  }, []);

  // Filter jobs
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((job) => job.department === departmentFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((job) => job.employmentType === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, departmentFilter, locationFilter, typeFilter]);

  const fetchPublicJobs = async () => {
    try {
      // Create a public API endpoint for job listings
      const response = await fetch("/api/careers/jobs");

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        console.error("Failed to fetch public jobs");
      }
    } catch (error) {
      console.error("Error fetching public jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Competitive salary";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Competitive salary";
  };

  const formatEmploymentType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getUniqueValues = (field: keyof Job) => {
    return Array.from(new Set(jobs.map((job) => job[field] as string))).filter(
      Boolean
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Company Careers
                  </h1>
                  <p className="text-sm text-gray-600">Join our growing team</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/login")}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Employee Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Build Your Career With Us</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Discover exciting opportunities to grow your skills, work with
            amazing people, and make a meaningful impact. Find your perfect role
            today.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>{jobs.length} Open Positions</span>
            </div>
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              <span>{getUniqueValues("department").length} Departments</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <span>{getUniqueValues("location").length} Locations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                aria-label="Filter by department"
              >
                <option value="">All Departments</option>
                {getUniqueValues("department").map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                aria-label="Filter by location"
              >
                <option value="">All Locations</option>
                {getUniqueValues("location").map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} positions
            </p>
            {(searchTerm ||
              departmentFilter ||
              locationFilter ||
              typeFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDepartmentFilter("");
                  setLocationFilter("");
                  setTypeFilter("");
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No positions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {jobs.length === 0
                ? "We don't have any open positions at the moment. Check back soon!"
                : "Try adjusting your search criteria or check back later for new opportunities."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/careers/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.department}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatEmploymentType(job.employmentType)}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {job._count?.applications || 0} applications
                  </div>
                  <div className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Our Company</h3>
              <p className="text-gray-300 text-sm">
                We're a growing company that values innovation, collaboration,
                and personal growth. Join us to be part of something amazing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact HR</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  careers@company.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-300 hover:text-white">
                  Employee Handbook
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Benefits Overview
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  Company Culture
                </a>
                <a href="#" className="block text-gray-300 hover:text-white">
                  FAQ
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>&copy; 2024 Company Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

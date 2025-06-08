"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Mail,
  Plus,
  Search,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthHeaders, getAuthToken } from "@/lib/auth";

interface Offer {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: string;
  offerDate: string;
  expiryDate: string;
  notes?: string;
  application: {
    id: string;
    candidateName: string;
  };
  job: {
    id: string;
    title: string;
    department: string;
  };
}

interface EligibleApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
}

interface NewOffer {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  expiryDate: string;
  notes: string;
}

export default function OffersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [eligibleApplications, setEligibleApplications] = useState<
    EligibleApplication[]
  >([]);

  const [newOffer, setNewOffer] = useState<NewOffer>({
    applicationId: "",
    candidateName: "",
    candidateEmail: "",
    position: "",
    department: "",
    salary: 0,
    startDate: "",
    expiryDate: "",
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
      fetchOffers();
      fetchEligibleApplications();
    }
  }, [isAuthenticated, user]);

  const fetchOffers = async (isRefresh = false) => {
    try {
      const token = getAuthToken();
      console.log(
        "Token for offers API:",
        token ? "Token exists" : "No token found"
      );

      if (!token) {
        console.error("No authentication token found");
        if (!isRefresh) setLoadingData(false);
        return;
      }

      const response = await fetch("/api/offers", {
        headers: getAuthHeaders(),
      });

      console.log("Offers API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
        console.log("Offers loaded:", data.offers?.length || 0);
      } else {
        console.error(
          "Offers API error:",
          response.status,
          response.statusText
        );
        if (response.status === 401) {
          console.error("Authentication failed - token might be invalid");
          // Optionally redirect to login
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      if (!isRefresh) {
        setLoadingData(false);
      }
    }
  };

  const fetchEligibleApplications = async () => {
    try {
      const response = await fetch("/api/careers/applications?status=OFFERED", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setEligibleApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching eligible applications:", error);
    }
  };

  const handleApplicationSelect = (applicationId: string) => {
    const selectedApp = eligibleApplications.find(
      (app) => app.id === applicationId
    );
    if (selectedApp) {
      setNewOffer({
        ...newOffer,
        applicationId,
        candidateName: selectedApp.candidateName,
        candidateEmail: selectedApp.candidateEmail,
        position: selectedApp.job.title,
        department: selectedApp.job.department,
      });
    }
  };

  const handleCreateOffer = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOffer),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewOffer({
          applicationId: "",
          candidateName: "",
          candidateEmail: "",
          position: "",
          department: "",
          salary: 0,
          startDate: "",
          expiryDate: "",
          notes: "",
        });
        fetchOffers();
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleStatusUpdate = async (offerId: string, status: string) => {
    try {
      console.log(`Updating offer ${offerId} to status: ${status}`);

      const token = getAuthToken();
      console.log("Token exists:", token ? "Yes" : "No");

      if (!token) {
        console.error("No authentication token found");
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);

        // Refresh the offers list
        await fetchOffers();

        // Show success message
        alert(`Offer status updated to ${status} successfully!`);
      } else {
        const errorData = await response.json();
        console.error("Update failed:", response.status, errorData);
        alert(
          `Failed to update offer status: ${
            errorData.error || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
      alert(
        `Error updating offer status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleHireCandidate = async (offer: Offer) => {
    if (!confirm(`Are you sure you want to hire ${offer.candidateName}? This will create an employee record and they will be able to login to the employee portal.`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No authentication token found");
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      // Create employee from offer
      const employeeData = {
        firstName: offer.candidateName.split(' ')[0],
        lastName: offer.candidateName.split(' ').slice(1).join(' ') || 'Unknown',
        email: offer.candidateEmail,
        department: offer.department,
        position: offer.position,
        salary: offer.salary,
        hireDate: offer.startDate,
        offerId: offer.id,
        role: "EMPLOYEE",
        password: "welcome123" // Default password - should be changed on first login
      };

      console.log("Creating employee from offer:", employeeData);

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Employee created successfully:", result);
        
        // Refresh offers to show updated status
        await fetchOffers();
        
        alert(`${offer.candidateName} has been successfully hired and added to the employee directory! They can now login to the employee portal with email: ${offer.candidateEmail} and password: welcome123`);
      } else {
        const errorData = await response.json();
        console.error("Failed to create employee:", errorData);
        alert(`Failed to hire candidate: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error hiring candidate:", error);
      alert(`Error hiring candidate: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case "pending":
        return matchesSearch && offer.status === "PENDING";
      case "sent":
        return matchesSearch && offer.status === "SENT";
      case "accepted":
        return matchesSearch && offer.status === "ACCEPTED";
      case "rejected":
        return matchesSearch && offer.status === "REJECTED";
      default:
        return matchesSearch;
    }
  });

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
            Only HR Managers and Administrators can access offer management.
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    totalOffers: offers.length,
    pendingOffers: offers.filter((o) => o.status === "PENDING").length,
    sentOffers: offers.filter((o) => o.status === "SENT").length,
    acceptedOffers: offers.filter((o) => o.status === "ACCEPTED").length,
    rejectedOffers: offers.filter((o) => o.status === "REJECTED").length,
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
                  <FileText className="h-8 w-8 mr-3 text-green-600" />
                  Offer Management
                </h1>
                <p className="text-gray-600">
                  Create, track, and manage job offers
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </button>
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
                  Total Offers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.sentOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.acceptedOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejectedOffers}
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
                { id: "all", label: "All Offers", icon: FileText },
                { id: "pending", label: "Pending", icon: Clock },
                { id: "sent", label: "Sent", icon: Send },
                { id: "accepted", label: "Accepted", icon: CheckCircle },
                { id: "rejected", label: "Rejected", icon: XCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
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
            <label htmlFor="offer-search" className="sr-only">
              Search offers
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="offer-search"
              type="text"
              placeholder="Search by candidate, position, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
            />
          </div>
        </div>

        {/* Offers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Offers
            </h2>

            {filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No offers found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create First Offer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <User className="h-6 w-6 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {offer.candidateName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {offer.candidateEmail}
                            </p>
                          </div>
                        </div>

                        <div className="ml-9 space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Position:</span>{" "}
                            {offer.position} - {offer.department}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />$
                              {offer.salary.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Start:{" "}
                              {new Date(offer.startDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Expires:{" "}
                              {new Date(offer.expiryDate).toLocaleDateString()}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                offer.status
                              )}`}
                            >
                              {offer.status}
                            </span>
                          </div>

                          {offer.notes && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span>{" "}
                              {offer.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {offer.status === "PENDING" && (
                          <button
                            onClick={() => handleStatusUpdate(offer.id, "SENT")}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Send Offer
                          </button>
                        )}

                        {offer.status === "SENT" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(offer.id, "ACCEPTED")
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Mark Accepted
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(offer.id, "REJECTED")
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Mark Rejected
                            </button>
                          </>
                        )}

                        {offer.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleHireCandidate(offer)}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                          >
                            <User className="h-3 w-3 mr-1" />
                            Hire Candidate
                          </button>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowOfferModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View offer details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Send email to candidate"
                          >
                            <Mail className="h-4 w-4" />
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
      </div>

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create Job Offer
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close create offer modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="applicationSelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Application *
                </label>
                <select
                  id="applicationSelect"
                  value={newOffer.applicationId}
                  onChange={(e) => handleApplicationSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  required
                >
                  <option value="">
                    -- Select an application to create offer --
                  </option>
                  {eligibleApplications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidateName} - {app.job.title} (
                      {app.job.department})
                    </option>
                  ))}
                </select>
                {eligibleApplications.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No applications with &quot;OFFERED&quot; status found.
                    Applications must have &quot;OFFERED&quot; status before
                    creating offers.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="candidateName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Candidate Name
                  </label>
                  <input
                    id="candidateName"
                    type="text"
                    value={newOffer.candidateName}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        candidateName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="candidateEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="candidateEmail"
                    type="email"
                    value={newOffer.candidateEmail}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        candidateEmail: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    value={newOffer.position}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, position: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={newOffer.department}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, department: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="salary"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Salary
                  </label>
                  <input
                    id="salary"
                    type="number"
                    value={newOffer.salary === 0 ? '' : newOffer.salary}
                    onChange={(e) =>
                      setNewOffer(prev => ({ 
                        ...prev, 
                        salary: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 
                      }))}
                    placeholder="Enter salary amount"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={newOffer.startDate}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="expiryDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expiry Date
                  </label>
                  <input
                    id="expiryDate"
                    type="date"
                    value={newOffer.expiryDate}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, expiryDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={newOffer.notes}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500 text-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOffer}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Offer Details
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close offer details"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Candidate
                  </h4>
                  <p className="text-gray-900">{selectedOffer.candidateName}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedOffer.candidateEmail}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Position
                  </h4>
                  <p className="text-gray-900">{selectedOffer.position}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedOffer.department}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </h4>
                  <p className="text-gray-900 text-lg font-semibold">
                    ${selectedOffer.salary.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Status
                  </h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedOffer.status
                    )}`}
                  >
                    {selectedOffer.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </h4>
                  <p className="text-gray-900">
                    {new Date(selectedOffer.startDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </h4>
                  <p className="text-gray-900">
                    {new Date(selectedOffer.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedOffer.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedOffer.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

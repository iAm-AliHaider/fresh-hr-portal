interface OfferData {
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
  applicationId?: string;
  application: {
    id: string;
    candidateName: string;
  };
  job: {
    id: string;
    title: string;
    department: string;
  };
  updatedDate?: string;
}

// Global shared storage for offers (will be replaced with Prisma once Offer model is added)
export const globalOffers: OfferData[] = [
  {
    id: "1",
    candidateName: "John Smith",
    candidateEmail: "john.smith@email.com",
    position: "Senior Software Engineer",
    department: "Engineering",
    salary: 120000,
    startDate: "2024-02-01",
    status: "PENDING",
    offerDate: "2024-01-15",
    expiryDate: "2024-01-30",
    notes: "Excellent technical skills and strong cultural fit",
    applicationId: "1",
    application: {
      id: "1",
      candidateName: "John Smith",
    },
    job: {
      id: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
    },
  },
  {
    id: "2",
    candidateName: "Sarah Rodriguez",
    candidateEmail: "sarah.rodriguez@email.com",
    position: "UX Designer",
    department: "Design",
    salary: 85000,
    startDate: "2024-02-15",
    status: "SENT",
    offerDate: "2024-01-16",
    expiryDate: "2024-01-31",
    notes: "Outstanding portfolio and design thinking skills",
    applicationId: "2",
    application: {
      id: "2",
      candidateName: "Sarah Rodriguez",
    },
    job: {
      id: "2",
      title: "UX Designer",
      department: "Design",
    },
  },
];

export type { OfferData };

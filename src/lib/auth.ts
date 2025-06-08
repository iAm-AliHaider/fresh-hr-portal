// Utility function to get the authentication token
export function getAuthToken(): string | null {
  try {
    // Check for employee auth (HR, Admin, Employee)
    const employeeAuth = localStorage.getItem("employeeAuth");
    if (employeeAuth) {
      const { token } = JSON.parse(employeeAuth);
      return token;
    }

    // Check for candidate auth
    const candidateAuth = localStorage.getItem("candidateAuth");
    if (candidateAuth) {
      const { token } = JSON.parse(candidateAuth);
      return token;
    }

    // Fallback to legacy token
    const legacyToken = localStorage.getItem("hr-auth-token");
    if (legacyToken) {
      return legacyToken;
    }

    return null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

// Create auth headers for API requests
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
} 
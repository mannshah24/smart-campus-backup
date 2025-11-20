// API Base URL
export const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  
  // Events
  GET_EVENTS: '/api/events',
  CREATE_EVENT: '/api/admin/events',
  DELETE_EVENT: (id: number) => `/api/admin/events/${id}`,
  
  // Timetable
  GENERATE_TIMETABLE: '/api/admin/generate-timetable',
  GET_STUDENT_TIMETABLE: '/api/student/timetable',
  GET_ALL_TIMETABLES: '/api/admin/timetable',
  
  // Electives
  SUBMIT_ELECTIVE: '/api/student/submit-elective',
  GET_ELECTIVE_STATUS: '/api/student/elective-status',
  GET_SUBMISSIONS: '/api/admin/elective-submissions',
  ALLOCATE_ELECTIVES: '/api/admin/allocate-electives',
  GET_ALLOCATIONS: '/api/admin/elective-allocations',
};

// Helper function to make API calls
export async function apiCall(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  return { response, data };
}

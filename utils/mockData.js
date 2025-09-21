

export const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'Active',
    role: 'user',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'Blocked',
    role: 'user',
    createdAt: '2025-02-20T12:30:00Z',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@example.com',
    status: 'Active',
    role: 'admin',
    createdAt: '2025-01-01T08:00:00Z',
  },
];

export const mechanics = [
  {
    id: 1,
    name: 'AutoFix Pro',
    email: 'autofix@example.com',
    specialties: ['Flat Tire', 'Battery'],
    location: { lat: 37.78825, lng: -122.4324 },
    status: 'Available',
    rating: 4.8,
    jobsCompleted: 120,
  },
  {
    id: 2,
    name: 'Engine Masters',
    email: 'engine.masters@example.com',
    specialties: ['Engine Trouble', 'Brake Issue'],
    location: { lat: 37.7749, lng: -122.4194 },
    status: 'Busy',
    rating: 4.5,
    jobsCompleted: 85,
  },
  {
    id: 3,
    name: 'Quick Repair',
    email: 'quick.repair@example.com',
    specialties: ['Flat Tire', 'Engine Trouble', 'Battery'],
    location: { lat: 37.7801, lng: -122.4100 },
    status: 'Available',
    rating: 4.9,
    jobsCompleted: 200,
  },
];

export const bookings = [
  {
    id: 1,
    userId: 1,
    userName: 'John Doe',
    mechanicId: 1,
    mechanic: 'AutoFix Pro',
    issue: 'Flat Tire',
    status: 'In Progress',
    createdAt: '2025-09-10T09:00:00Z',
    location: { lat: 37.7870, lng: -122.4300 },
  },
  {
    id: 2,
    userId: 2,
    userName: 'Jane Smith',
    mechanicId: 2,
    mechanic: 'Engine Masters',
    issue: 'Engine Trouble',
    status: 'Completed',
    createdAt: '2025-09-05T14:20:00Z',
    location: { lat: 37.7750, lng: -122.4200 },
  },
  {
    id: 3,
    userId: 1,
    userName: 'John Doe',
    mechanicId: 3,
    mechanic: 'Quick Repair',
    issue: 'Battery',
    status: 'Pending',
    createdAt: '2025-09-18T16:45:00Z',
    location: { lat: 37.7790, lng: -122.4150 },
  },
];

export const jobRequests = [
  {
    id: 1,
    userId: 1,
    user: 'John Doe',
    issue: 'Battery',
    status: 'Pending',
    createdAt: '2025-09-19T08:00:00Z',
    location: { lat: 37.7860, lng: -122.4280 },
  },
  {
    id: 2,
    userId: 2,
    user: 'Jane Smith',
    issue: 'Brake Issue',
    status: 'Pending',
    createdAt: '2025-09-19T09:30:00Z',
    location: { lat: 37.7760, lng: -122.4180 },
  },
];

export const analytics = {
  totalUsers: 100,
  totalMechanics: 50,
  totalBookings: 20,
  activeBookings: 5,
  fraudReports: [
    {
      id: 1,
      userId: 2,
      userName: 'Jane Smith',
      reason: 'Fraudulent payment attempt',
      reportedAt: '2025-09-10T12:00:00Z',
    },
    {
      id: 2,
      userId: 1,
      userName: 'John Doe',
      reason: 'False booking report',
      reportedAt: '2025-09-15T15:00:00Z',
    },
  ],
};

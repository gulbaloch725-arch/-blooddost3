export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  NGO_ADMIN = 'NGOAdmin',
  DONOR = 'Donor',
  HOSPITAL = 'Hospital',
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  ngoId?: string;
  avatar?: string;
  needsPasswordReset?: boolean;
  isSeed?: boolean;
  createdBy?: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  name: string;
  bloodGroup: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    province: string;
    district?: string;
  };
  lastDonated: string; // ISO date string
  isAvailable: boolean;
  phone: string;
  whatsapp?: string;
  addedByNgoId?: string; // For multi-tenancy
  donationCount: number;
  isSeed?: boolean;
  createdBy?: string;
}

export interface BloodRequest {
  id: string;
  ngoId: string;
  ngoName: string;
  bloodGroup: string;
  units: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  location: string;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  createdAt: string;
  description: string;
  isSeed?: boolean;
  createdBy?: string;
}

export interface NGO {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo?: string;
  stamp?: string;
  district?: string;
  city?: string;
  coolOffPeriodDays?: number; // Default 90
  themeColor?: string;
  donorLimit?: number;
  isSeed?: boolean;
  createdBy?: string;
}

export interface InventoryItem {
  id: string;
  ngoId: string;
  bloodGroup: string;
  units: number;
  expiryDate: string; // ISO date string
  isSeed?: boolean;
  createdBy?: string;
}

export enum SubscriptionTier {
  FREE = 'Free',
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLDEN = 'Golden',
  SUPER_GOLD = 'Super Gold',
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'Active' | 'Pending' | 'Expired';
  expiryDate?: string;
  paymentProofUrl?: string; // For the screenshot
  submittedAt?: string;
  isSeed?: boolean;
  createdBy?: string;
}

export interface ThalassemiaPatient {
  id: string;
  name: string;
  fatherName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  lastTransfusion: string; // ISO date
  cycleDays: number;
  address: string;
  contactNumber: string;
  hospital: string;
  doctor: string;
  ngoId: string;
  isSeed?: boolean;
  createdBy?: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  ngoId: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  hospitalName?: string;
  city?: string;
  date: string; // ISO string
  isSeed?: boolean;
  createdBy?: string;
}

export interface SuggestionStore {
  hospitals: string[];
  cities: string[];
}

export enum NotificationType {
  GENERAL = 'General',
  NEW_FEATURE = 'New Feature',
  EMERGENCY = 'Emergency',
  MAINTENANCE = 'Maintenance',
}

export enum NotificationAudience {
  ALL = 'All Users',
  DONORS = 'Donors',
  NGOS = 'NGO Admins',
  CITY = 'Specific City',
  BLOOD_GROUP = 'Specific Blood Group',
}

export interface HealthCheckResult {
  module: string;
  status: 'passed' | 'failed' | 'warning';
  timestamp: string;
  details: {
    test: string;
    result: 'passed' | 'failed';
    errorMessage?: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  targetValue?: string; // For city or blood group
  createdAt: string;
  isPinned?: boolean;
  scheduledFor?: string; // ISO date
  authorId: string;
  isSeed?: boolean;
  createdBy?: string;
}

export interface NotificationReadStatus {
  userId: string;
  notificationId: string;
  readAt: string;
  isSeed?: boolean;
  createdBy?: string;
}

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
}

export interface InventoryItem {
  id: string;
  ngoId: string;
  bloodGroup: string;
  units: number;
  expiryDate: string; // ISO date string
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
}

export interface SuggestionStore {
  hospitals: string[];
  cities: string[];
}

// Lawyer Search Types

export interface LawyerSearchResult {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  profileImage?: string;
  specializations: Array<{
    id: string;
    name: string;
    yearsOfExperience: number;
  }>;
  relevanceScore?: number;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AvailableFilter {
  id: string;
  name: string;
  count: number;
}

export interface SearchResponse {
  success: boolean;
  results: LawyerSearchResult[];
  pagination: SearchPagination;
  availableFilters: AvailableFilter[];
  didYouMean?: string;
  query: string;
}

export interface AutocompleteResponse {
  success: boolean;
  suggestions: Array<{
    id: string;
    name: string;
    specializations: string[];
  }>;
}

export interface FiltersResponse {
  success: boolean;
  specializations: AvailableFilter[];
}

export interface SearchParams {
  q?: string;
  specializations?: string[];
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'experience' | 'recent';
}

export type SortOption = 'relevance' | 'experience' | 'recent';

// Lawyer Profile Types
export interface LawyerDocument {
  id: string;
  type: string;
  url: string;
  publicId: string;
  originalName?: string;
  createdAt: string;
}

export interface LawyerProfileSpecialization {
  id: string;
  name: string;
  yearsOfExperience: number;
}

export interface LawyerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
  profileImage?: string;
  experienceDescription?: string;
  specializations: LawyerProfileSpecialization[];
  documents: LawyerDocument[];
}

export interface LawyerProfileResponse {
  success: boolean;
  lawyer: LawyerProfile;
}


export interface CreateBranchRequest {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  description?: string;
  officeId: number;
  // Address details
  street?: string;
  city: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  addressNotes?: string;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  description?: string;
  active?: boolean;
  // Address updates
  street?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  addressNotes?: string;
}

export interface BranchFilters {
  active?: boolean;
  officeId?: number;
  city?: string;
  region?: string;
}

export interface BranchResponse {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  officeId: number;
  office: {
    id: number;
    name: string;
    code: string;
  };
  address: {
    id: number;
    street: string | null;
    city: string;
    district: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    latitude: number;
    longitude: number;
    notes: string | null;
  };
}

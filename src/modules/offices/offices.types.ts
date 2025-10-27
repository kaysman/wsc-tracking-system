export interface CreateOfficeRequest {
  name: string;
  code: string;
  phone: string;
  email?: string;
  description?: string;
  street?: string;
  city: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  addressNotes?: string;
}

export interface UpdateOfficeRequest {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  description?: string;
  active?: boolean;
  street?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  addressNotes?: string;
}

export interface OfficeFilters {
  active?: boolean;
  city?: string;
  region?: string;
}

export interface OfficeResponse {
  id: number;
  name: string;
  code: string;
  phone: string;
  email: string | null;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
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

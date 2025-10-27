export interface CreateDeliveryPlaceRequest {
  placeName: string;
  receiverName: string;
  receiverPhone?: string;

  street?: string;
  city: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  addressNotes?: string;
  notes?: string;
}

export interface UpdateDeliveryPlaceRequest {
  placeName?: string;
  receiverName?: string;
  receiverPhone?: string;
  active?: boolean;

  street?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  addressNotes?: string;
  notes?: string;
}

export interface DeliveryPlaceFilters {
  active?: boolean;
  city?: string;
  region?: string;
  search?: string;
}

export interface DeliveryPlaceResponse {
  id: number;
  placeName: string;
  receiverName: string;
  receiverPhone: string | null;
  active: boolean;
  notes: string | null;
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

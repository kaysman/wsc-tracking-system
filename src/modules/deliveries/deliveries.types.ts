export interface CreateDeliveryRequest {
  deliveryNumber: string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  quantity?: number;
  quantityUnit?: string;
  pricePerUnit?: number;
  totalAmount?: number;
  transportFee?: number;
  priority?: "LOW" | "NORMAL" | "URGENT";
  driverName?: string;
  notes?: string;
  deliveryPlaceId: number;
  truckId: number;
}

export interface UpdateDeliveryRequest {
  deliveryNumber?: string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  actualDate?: Date | string;
  completedAt?: Date | string;
  quantity?: number;
  quantityUnit?: string;
  pricePerUnit?: number;
  totalAmount?: number;
  transportFee?: number;
  status?: "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "FAILED";
  priority?: "LOW" | "NORMAL" | "URGENT";
  distanceTraveled?: number;
  driverName?: string;
  notes?: string;
  cancellationReason?: string;
  deliveryPlaceId?: number;
  truckId?: number;
}

export interface DeliveryFilters {
  status?: "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "FAILED";
  priority?: "LOW" | "NORMAL" | "URGENT";
  deliveryPlaceId?: number;
  truckId?: number;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
}

export interface DeliveryResponse {
  id: number;
  deliveryNumber: string;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  actualDate: Date | null;
  completedAt: Date | null;
  quantity: number | null;
  quantityUnit: string | null;
  pricePerUnit: number | null;
  totalAmount: number | null;
  transportFee: number | null;
  status: string;
  priority: string;
  distanceTraveled: number | null;
  driverName: string | null;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  deliveryPlace: {
    id: number;
    placeName: string;
    receiverName: string;
    receiverPhone: string | null;
  };
  truck: {
    id: number;
    plateNumber: string;
    engineNumber: string;
    model: string | null;
    make: string | null;
  };
}

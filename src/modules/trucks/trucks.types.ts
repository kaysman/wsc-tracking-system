export interface CreateTruckRequest {
  engineNumber: string;
  plateNumber: string;
  registrationNumber: string;
  model?: string;
  make?: string;
  year?: number;
  color?: string;
  capacity: number;
  capacityUnit?: string;
  registrationDate?: string | Date;
  registrationExpiry?: string | Date;
  insuranceExpiry?: string | Date;
  officeId?: number;
  branchId?: number;
  notes?: string;
}

export interface UpdateTruckRequest {
  engineNumber?: string;
  plateNumber?: string;
  registrationNumber?: string;
  model?: string;
  make?: string;
  year?: number;
  color?: string;
  capacity?: number;
  capacityUnit?: string;
  registrationDate?: string | Date;
  registrationExpiry?: string | Date;
  insuranceExpiry?: string | Date;
  status?: "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE" | "OUT_OF_SERVICE";
  active?: boolean;
  officeId?: number;
  branchId?: number;
  notes?: string;
}

export interface UpdateMaintenanceRequest {
  lastMaintenanceDate: string | Date;
  maintenanceType:
    | "ROUTINE_SERVICE"
    | "OIL_CHANGE"
    | "TIRE_REPLACEMENT"
    | "BRAKE_SERVICE"
    | "ENGINE_REPAIR"
    | "TANK_CLEANING"
    | "INSPECTION"
    | "EMERGENCY_REPAIR"
    | "OTHER";
  maintenanceDescription?: string;
  maintenanceServiceProvider?: string;
  maintenanceCompletedDate?: string | Date;
  nextMaintenanceDate?: string | Date;
}

export interface TruckFilters {
  status?: "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE" | "OUT_OF_SERVICE";
  active?: boolean;
  officeId?: number;
  branchId?: number;
  make?: string;
}

export interface TruckResponse {
  id: number;
  engineNumber: string;
  plateNumber: string;
  registrationNumber: string;
  model: string | null;
  make: string | null;
  year: number | null;
  color: string | null;
  capacity: number;
  capacityUnit: string;
  registrationDate: Date | null;
  registrationExpiry: Date | null;
  insuranceExpiry: Date | null;
  lastMaintenanceDate: Date | null;
  maintenanceType: string | null;
  maintenanceDescription: string | null;
  maintenanceServiceProvider: string | null;
  maintenanceCompletedDate: Date | null;
  nextMaintenanceDate: Date | null;
  status: string;
  active: boolean;
  notes: string | null;
  officeId: number | null;
  branchId: number | null;
  createdAt: Date;
  updatedAt: Date;
  office?: {
    id: number;
    name: string;
    code: string;
  } | null;
  branch?: {
    id: number;
    name: string;
    code: string;
  } | null;
}

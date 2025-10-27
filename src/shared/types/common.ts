export interface JWTPayload {
  userId: number;
  roleId: number;
  officeId?: number | null;
  branchId?: number | null;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RequestScope {
  officeId?: number;
  branchId?: number;
}

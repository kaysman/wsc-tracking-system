export interface RegisterRequest {
  name: string;
  surname: string;
  fathername: string;
  phone: string;
  password: string;
  birthdate?: string | Date;
  email?: string;
  workEmail?: string;
  workPhone?: string;
  roleId: number;
  officeId?: number;
  branchId?: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}


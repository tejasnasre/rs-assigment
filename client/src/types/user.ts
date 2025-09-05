export const UserRole = {
  ADMIN: "system_administrator",
  USER: "normal_user",
  STORE_OWNER: "store_owner",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: UserRole; // Only admin can set role during creation
}

export interface SignInData {
  email: string;
  password: string;
  role: UserRole;
}

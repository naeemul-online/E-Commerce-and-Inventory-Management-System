export type IAuthUser = {
  email: string;
  role: Role;
} | null;

export type Role = {
  enum: ["USER", "ADMIN", "SUPER_ADMIN"];
};

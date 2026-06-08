import { apiGet } from "./client";

export type Profile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isVerified: boolean;
};

export async function getMyProfile() {
  return apiGet<Profile>("/api/profiles/me");
}
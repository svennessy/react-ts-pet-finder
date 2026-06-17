import { apiGet } from "./client";
import type { Profile } from "../types/auth";

export type { Profile };

export async function getMyProfile() {
  return apiGet<Profile>("/api/profiles/me");
}
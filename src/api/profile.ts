import { apiGet } from "./client";
import type { Profile } from "../types/auth";

export type { Profile };

export async function getMyProfile() {
  return apiGet<Profile>("/api/profiles/me");
}

export type ProfileDashboard = {
  profile: Profile;
  stats: {
    reportsCount: number;
    favoritesCount: number;
    sightingsCount: number;
  };
  recentReports: Array<{
    id: string;
    name: string;
    reportStatus: string;
    createdAt: string;
    latitude: number;
    longitude: number;
  }>;
};

export async function getProfileDashboard() {
  return apiGet<ProfileDashboard>("/api/profiles/me/dashboard");
}

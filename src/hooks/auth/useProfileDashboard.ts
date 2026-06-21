import { useEffect, useState } from "react";
import {
  getProfileDashboard,
  type ProfileDashboard,
} from "../../api/profile";

export function useProfileDashboard() {
  const [dashboard, setDashboard] =
    useState<ProfileDashboard | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  return {
    dashboard,
    loading,
  };
}
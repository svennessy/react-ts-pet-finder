import { useEffect, useState } from "react";
import { getMyProfile, type Profile } from "../../api/profile";
import { useAuthSession } from "./useAuthSession";

export function useProfile() {
  const auth = useAuthSession();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    getMyProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [auth.isAuthenticated]);

  return {
    profile,
    loading,
  };
}
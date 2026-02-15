import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: number;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  coinsBalance: number;
  diamondsBalance: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isVerified: boolean;
  isOnline: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      level: (user.level as any) || "bronze",
      coinsBalance: user.coinsBalance || 0,
      diamondsBalance: user.diamondsBalance || 0,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      likesCount: user.likesCount || 0,
      isVerified: user.isVerified || false,
      isOnline: user.isOnline || false,
    });
    setLoading(false);
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: new Error(data.message) };
      }

      const updatedUser = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { profile, loading, error, updateProfile };
}

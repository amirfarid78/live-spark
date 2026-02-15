import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, firebaseSignOut, googleProvider, signInWithPopup, type FirebaseUser } from "@/lib/firebase";

interface AuthUser {
  id: number;
  email: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  level: string;
  coinsBalance: number;
  diamondsBalance: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isVerified: boolean;
  isOnline: boolean;
  firebaseUid?: string;
  phoneNumber?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { username?: string; display_name?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (firebaseUser: FirebaseUser) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
      setUser(null);
      setFirebaseUser(null);
      setLoading(false);
      return;
    }

    setFirebaseUser(fbUser);

    try {
      const token = await fbUser.getIdToken();
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          idToken: token,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to sync with backend:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            setLoading(false);
            return;
          }
        }
      } catch {}

      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          syncWithBackend(fbUser);
        } else {
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    checkSession().then((unsub) => {
      if (unsub) unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncWithBackend]);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { username?: string; display_name?: string }
  ) => {
    try {
      const fbResult = await createUserWithEmailAndPassword(auth, email, password);
      const token = await fbResult.user.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firebaseUid: fbResult.user.uid,
          email: fbResult.user.email,
          phoneNumber: fbResult.user.phoneNumber,
          displayName: metadata?.display_name || email.split("@")[0],
          username: metadata?.username,
          idToken: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.message) };
      }
      setUser(data.user);
      setFirebaseUser(fbResult.user);
      return { error: null };
    } catch (err: any) {
      const message = err.code === "auth/email-already-in-use"
        ? "This email is already registered"
        : err.code === "auth/weak-password"
        ? "Password should be at least 6 characters"
        : err.message;
      return { error: new Error(message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const fbResult = await signInWithEmailAndPassword(auth, email, password);
      const token = await fbResult.user.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firebaseUid: fbResult.user.uid,
          email: fbResult.user.email,
          phoneNumber: fbResult.user.phoneNumber,
          displayName: fbResult.user.displayName,
          idToken: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.message) };
      }
      setUser(data.user);
      setFirebaseUser(fbResult.user);
      return { error: null };
    } catch (err: any) {
      const message = err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
        ? "Invalid email or password"
        : err.message;
      return { error: new Error(message) };
    }
  };

  const signInWithPhone = async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName || `User${fbUser.uid.slice(0, 6)}`,
          idToken: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.message) };
      }
      setUser(data.user);
      setFirebaseUser(fbUser);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const token = await fbUser.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0],
          photoURL: fbUser.photoURL,
          idToken: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.message) };
      }
      setUser(data.user);
      setFirebaseUser(fbUser);
      return { error: null };
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        return { error: new Error("Sign-in cancelled") };
      }
      if (err.code === "auth/popup-blocked") {
        return { error: new Error("Pop-up was blocked by your browser. Please allow pop-ups and try again.") };
      }
      return { error: new Error(err.message || "Google sign-in failed") };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signUp, signIn, signInWithPhone, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

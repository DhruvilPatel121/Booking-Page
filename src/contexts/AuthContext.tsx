import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
// @ts-ignore
import { supabase } from "@/db/supabase";
import type { User } from "@supabase/supabase-js";
// @ts-ignore
import type { Profile } from "@/types/types";
import { toast } from "sonner";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("获取用户信息失败:", error);
    return null;
  }
  return data;
}
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (
    username: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signUpWithUsername: (
    username: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      // @ts-ignore
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        }
      })
      // @ts-ignore
      .catch((error) => {
        toast.error(`获取用户信息失败: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // @ts-ignore
    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      // Check if username is already a full email address
      let email: string;
      
      if (username.includes('@')) {
        // Username is already an email, use it directly
        email = username.toLowerCase().trim();
      } else {
        // Username is not an email, create it from username
        const sanitizedUsername = username
          .toLowerCase()
          // Allow letters, numbers, dots, underscores, hyphens (valid email characters)
          .replace(/[^a-z0-9._-]/g, '')
          // Ensure it starts with a letter or number
          .replace(/^[^a-z0-9]/g, '')
          // Remove consecutive dots and special characters
          .replace(/[._-]{2,}/g, '.')
          // Remove dots at start or end
          .replace(/^\.+|\.+$/g, '');
        
        if (!sanitizedUsername || sanitizedUsername.length < 3) {
          throw new Error("Username must contain at least 3 alphanumeric characters");
        }
        
        email = `${sanitizedUsername}@gmail.com`;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      // Check if username is already a full email address
      let email: string;
      let sanitizedUsername: string;
      
      if (username.includes('@')) {
        // Username is already an email, use it directly
        email = username.toLowerCase().trim();
        sanitizedUsername = username.split('@')[0]; // Extract username part for metadata
      } else {
        // Username is not an email, create it from username
        sanitizedUsername = username
          .toLowerCase()
          // Allow letters, numbers, dots, underscores, hyphens (valid email characters)
          .replace(/[^a-z0-9._-]/g, '')
          // Ensure it starts with a letter or number
          .replace(/^[^a-z0-9]/g, '')
          // Remove consecutive dots and special characters
          .replace(/[._-]{2,}/g, '.')
          // Remove dots at start or end
          .replace(/^\.+|\.+$/g, '');
        
        if (!sanitizedUsername || sanitizedUsername.length < 3) {
          throw new Error("Username must contain at least 3 alphanumeric characters");
        }
        
        email = `${sanitizedUsername}@gmail.com`;
      }
      
      // Basic email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format generated from username");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Store original username
            email_username: sanitizedUsername, // Store sanitized version
          },
        },
      });

      if (error) throw error;
      
      // Since we can't send email confirmation to generated Gmail addresses,
      // we'll handle this by checking if the user was created and then signing them in
      if (data.user && !data.session) {
        // User created but session not confirmed (email not confirmed)
        // Try to sign in directly since we control the email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          // If direct sign in fails, return a more helpful error
          throw new Error("Account created but requires email confirmation. Please contact support.");
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithUsername,
        signUpWithUsername,
        signOut,
        refreshProfile,
      }}
    >
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

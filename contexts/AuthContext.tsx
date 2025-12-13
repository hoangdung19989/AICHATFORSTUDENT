
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { UserProfile } from '../types/user';

// Define types as any to avoid import errors from @supabase/supabase-js
type User = any;
type Session = any;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (error) {
              if (error.code !== 'PGRST116') {
                  console.error('Error fetching profile:', error);
              }
              return null;
          }
          return data as UserProfile;
      } catch (err) {
          console.error('Exception fetching profile:', err);
          return null;
      }
  };

  const refreshProfile = async () => {
      if (user) {
          const p = await fetchProfile(user.id);
          setProfile(p);
      }
  };

  useEffect(() => {
    let mounted = true;

    // --- AN TOÀN: Tự động tắt loading sau 2 giây ---
    const timeout = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn("Auth loading timed out - Forcing app load.");
            setIsLoading(false);
        }
    }, 2000);

    const initAuth = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            const currentSession = data?.session;
            
            if (!mounted) return;

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                const p = await fetchProfile(currentSession.user.id);
                if (mounted) setProfile(p);
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
        } finally {
            if (mounted) setIsLoading(false);
        }
    };

    initAuth();

    const { data } = supabase.auth.onAuthStateChange(async (event: string, session: Session) => {
      if (!mounted) return;
      
      // Nếu là sự kiện SIGNED_OUT, ta không cần làm gì nhiều vì hàm signOut đã xử lý state rồi
      // Điều này tránh xung đột state gây ra loading ảo
      if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
           const p = await fetchProfile(session.user.id);
           if (mounted) setProfile(p);
      } else {
          if (mounted) setProfile(null);
      }
      
      if (mounted) setIsLoading(false);
    });

    const subscription = data?.subscription;

    return () => {
        mounted = false;
        clearTimeout(timeout);
        if (subscription?.unsubscribe) {
            subscription.unsubscribe();
        }
    };
  }, []);

  const signOut = async () => {
    // --- OPTIMISTIC UPDATE (Cập nhật lạc quan) ---
    // 1. Xóa trạng thái ngay lập tức để UI chuyển về trang Login liền
    // KHÔNG set isLoading(true) ở đây để tránh hiện vòng quay loading
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // 2. Gọi API đăng xuất chạy ngầm (nếu lỗi cũng không ảnh hưởng trải nghiệm thoát của user)
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Lỗi đăng xuất ngầm:", error);
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

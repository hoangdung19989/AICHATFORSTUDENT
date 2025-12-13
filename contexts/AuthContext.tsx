
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
              // Bỏ qua lỗi PGRST116 (không tìm thấy dòng nào) vì có thể trigger chưa chạy xong
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

    // --- AN TOÀN: Tự động tắt loading sau 2 giây (giảm từ 5s) ---
    // Nếu Database bị treo (infinite loop), app sẽ tự vào sau 2s thay vì xoay mãi.
    const timeout = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn("Auth loading timed out (Database might be slow or stuck) - Forcing app load.");
            setIsLoading(false);
        }
    }, 2000);

    const initAuth = async () => {
        try {
            // 1. Lấy session hiện tại
            const { data } = await supabase.auth.getSession();
            const currentSession = data?.session;
            
            if (!mounted) return;

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            // 2. Nếu đã đăng nhập, lấy thông tin profile
            if (currentSession?.user) {
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

    // 3. Lắng nghe sự thay đổi (đăng nhập/đăng xuất/token refresh)
    const { data } = supabase.auth.onAuthStateChange(async (_event: string, session: Session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
           // Fetch lại profile để đảm bảo dữ liệu mới nhất
           const p = await fetchProfile(session.user.id);
           if (mounted) setProfile(p);
      } else {
          if (mounted) setProfile(null);
      }
      
      // Luôn tắt loading khi trạng thái thay đổi xong
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
    setIsLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsLoading(false);
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

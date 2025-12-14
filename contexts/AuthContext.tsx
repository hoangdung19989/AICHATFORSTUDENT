
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

  // --- FORCE UPDATE ROLE LOGIC ---
  // Kiểm tra nếu người dùng đã chọn role mới ở LoginView (lưu trong localStorage)
  // và role đó khác với role hiện tại trong DB -> Ép cập nhật.
  const checkAndEnforceRole = async (currentUser: User) => {
      const intendedRole = localStorage.getItem('intended_role');
      if (intendedRole && currentUser) {
          console.log(`[Auth] Intended role: ${intendedRole}, Current Metadata: ${currentUser.user_metadata?.role}`);
          
          // Nếu role mong muốn khác role trong metadata, hoặc khác role trong profile (sẽ check sau)
          if (currentUser.user_metadata?.role !== intendedRole) {
              console.log("[Auth] Forcing role update...");
              const { data, error } = await supabase.auth.updateUser({
                  data: { role: intendedRole }
              });
              
              if (!error && data.user) {
                  setUser(data.user);
                  // Trigger UPDATE SQL sẽ chạy ở server để đồng bộ Profile
              }
          }
          // Xóa sau khi đã xử lý
          localStorage.removeItem('intended_role');
      }
  };

  useEffect(() => {
    let mounted = true;

    // --- AN TOÀN: Tự động tắt loading sau 5 giây ---
    const timeout = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn("Auth loading timed out - Forcing app load.");
            setIsLoading(false);
        }
    }, 5000);

    const initAuth = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            const currentSession = data?.session;
            
            if (!mounted) return;

            if (currentSession?.user) {
                setSession(currentSession);
                setUser(currentSession.user);
                
                // 1. Kiểm tra và ép cập nhật Role nếu cần
                await checkAndEnforceRole(currentSession.user);

                // 2. Lấy Profile
                let p = await fetchProfile(currentSession.user.id);
                
                // 3. (Cứu hộ) Nếu profile bị xóa mất nhưng User auth vẫn còn -> Tạo lại profile
                if (!p) {
                    console.log("[Auth] Profile missing. Attempting to recreate...");
                    // Thử cập nhật user metadata để kích hoạt lại trigger INSERT/UPDATE
                    // Hoặc chèn trực tiếp nếu RLS cho phép
                    const role = currentSession.user.user_metadata?.role || 'student';
                    await supabase.from('profiles').upsert({
                        id: currentSession.user.id,
                        email: currentSession.user.email,
                        role: role,
                        status: role === 'teacher' ? 'pending' : 'active',
                        full_name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0],
                        avatar_url: currentSession.user.user_metadata?.avatar_url
                    });
                    p = await fetchProfile(currentSession.user.id);
                }

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
           // Cũng kiểm tra role khi Auth State thay đổi (ví dụ sau redirect OAuth)
           await checkAndEnforceRole(session.user);
           
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
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('intended_role');
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

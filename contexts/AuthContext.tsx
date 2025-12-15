
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
          
          if (error) return null;
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

  // --- QUAN TRỌNG: HÀM SỬA LỖI ROLE ---
  // Hàm này kiểm tra localStorage xem lúc nãy user có chọn "Giáo viên" không.
  // Nếu có, nó sẽ gọi hàm SQL `claim_teacher_role` để sửa lại Database.
  const fixRoleAfterGoogleLogin = async () => {
      const intendedRole = localStorage.getItem('intended_role');
      
      if (intendedRole === 'teacher') {
          console.log("[Auth] Phát hiện Teacher Login. Đang gọi SQL để sửa Role...");
          
          // Gọi hàm RPC trong Database
          const { error } = await supabase.rpc('claim_teacher_role');
          
          if (error) {
              console.error("LỖI NGHIÊM TRỌNG: Không gọi được hàm SQL 'claim_teacher_role'.");
              console.error("Vui lòng chạy đoạn SQL trong README.md trên Supabase SQL Editor.");
              console.error("Chi tiết lỗi:", error);
          } else {
              console.log("[Auth] Đã sửa Role thành công!");
          }
          
          localStorage.removeItem('intended_role');
          return true; // Trả về true để báo hiệu cần load lại profile
      }
      return false;
  };

  useEffect(() => {
    let mounted = true;

    // Timeout an toàn
    const timeout = setTimeout(() => {
        if (mounted && isLoading) {
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
                
                // 1. CHẠY SỬA LỖI TRƯỚC KHI LẤY PROFILE
                await fixRoleAfterGoogleLogin();

                // 2. Lấy Profile (lúc này data đã đúng)
                let p = await fetchProfile(currentSession.user.id);
                
                // 3. Tạo profile nếu chưa có
                if (!p) {
                    const role = currentSession.user.user_metadata?.role || 'student';
                    await supabase.from('profiles').insert({
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
            console.error("Auth init error:", error);
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
          localStorage.removeItem('intended_role');
          return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
           // Nếu vừa đăng nhập, chạy lại fix role để chắc chắn
           if (event === 'SIGNED_IN') {
               await fixRoleAfterGoogleLogin();
           }
           
           const p = await fetchProfile(session.user.id);
           if (mounted) setProfile(p);
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
        console.error("Logout error:", error);
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

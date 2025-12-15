
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

  // --- LOGIC SỬA LỖI QUAN TRỌNG: FIX ROLE GOOGLE LOGIN ---
  const fixRoleAfterGoogleLogin = async (userId: string) => {
      const intendedRole = localStorage.getItem('intended_role');
      
      // Chỉ xử lý nếu người dùng có ý định là Teacher
      if (intendedRole === 'teacher') {
          console.log("[Auth] Phát hiện đăng nhập Teacher qua Google. Đang đồng bộ dữ liệu...");
          
          // Gọi hàm RPC đặc biệt để ép Database cập nhật Role = teacher và Status = pending
          // Hàm này (claim_teacher_role) cần được tạo trong SQL Editor (xem README.md)
          const { error } = await supabase.rpc('claim_teacher_role');
          
          if (error) {
              console.error("[Auth] Lỗi khi gọi RPC claim_teacher_role:", error);
              // Fallback: Thử update thủ công (có thể thất bại do RLS)
              await supabase.auth.updateUser({ data: { role: 'teacher' } });
          } else {
              console.log("[Auth] Đã đồng bộ thành công Role Teacher (Pending).");
          }
          
          // Xóa cờ sau khi xử lý xong
          localStorage.removeItem('intended_role');
          
          // Trả về true để báo hiệu cần reload profile
          return true;
      }
      return false;
  };

  useEffect(() => {
    let mounted = true;

    // Timeout an toàn
    const timeout = setTimeout(() => {
        if (mounted && isLoading) {
            console.warn("Auth loading timed out.");
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
                
                // 1. CHẠY LOGIC SỬA LỖI ROLE TRƯỚC KHI LẤY PROFILE
                await fixRoleAfterGoogleLogin(currentSession.user.id);

                // 2. Lấy Profile (lúc này database đã đúng role)
                let p = await fetchProfile(currentSession.user.id);
                
                // 3. (Cứu hộ) Nếu chưa có profile, tạo mới
                if (!p) {
                    console.log("[Auth] Profile missing. Creating default...");
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
           // Cũng chạy logic sửa lỗi khi có sự kiện đăng nhập (SIGNED_IN)
           if (event === 'SIGNED_IN') {
                await fixRoleAfterGoogleLogin(session.user.id);
           }
           
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

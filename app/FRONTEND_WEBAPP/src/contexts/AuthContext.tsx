import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type {
  AuthContextValue,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth.types";
import { authApi } from "../services/AuthAPI";
import { userStorage, tokenStorage } from "./user.storage";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // ใช้สำหรับจัดการ Logout และเคลียร์ State ทั้งหมด
  // ใช้สำหรับจัดการ Logout และเคลียร์ State ทั้งหมด
  const logout = useCallback(async () => {
    // ไม่มี API Logout สั่งเคลียร์ Client State ได้เลย
    setUser(null);
    setIsAuthenticated(false);
    userStorage.clear();
    tokenStorage.clear();
  }, []);

  // ฟังก์ชันเช็คสถานะจาก Cookie (ยิงไปที่ /me) -> ยกเลิกการยิง API
  const refreshMe = useCallback(async () => {
    // เนื่องจากไม่มี API /me ให้เช็ค LocalStorage แทน
    const storedUser = userStorage.get();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsBootstrapping(false);
  }, []);

  const login = async (payload: LoginRequest) => {
    const data = await authApi.login(payload);

    // Save token if available (Hybrid Auth)
    if (data.token) {
      tokenStorage.set(data.token);
    }

    // หลัง Login สำเร็จ Browser จะได้ Cookie มาแล้ว
    // เก็บ User ลง Local Storage และ useState
    if (data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      userStorage.set(data.user); // เก็บ User ลง Local Storage
    } else {
      await refreshMe();
    }
  };

  const register = async (payload: RegisterRequest) => {
    const data = await authApi.register(payload);

    // Save token if available (Hybrid Auth)
    if (data.token) {
      tokenStorage.set(data.token);
    }

    // หลัง Register สำเร็จ Browser จะได้ Cookie มาแล้ว
    // เก็บ User ลง Local Storage และ useState
    if (data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      userStorage.set(data.user); // เก็บ User ลง Local Storage
    } else {
      await refreshMe();
    }
  };

  // เช็คสถานะทันทีที่โหลดหน้าเว็บ (Refresh หน้าจอ)
  useEffect(() => {
    // ดึง User จาก Local Storage มาโชว์ก่อน (เพื่อให้ UI ไม่ว่าง)
    const storedUser = userStorage.get();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
      setIsBootstrapping(false); // ให้ UI แสดงข้อมูลจาก Local Storage ทันที
    }

    // พร้อมกับยิง API /me (ใช้ Token ใน Cookie)
    // ถ้า Server บอกว่า Token ผ่าน ก็ใช้ข้อมูลใหม่จาก Server ทับลงไป
    // ถ้า Server บอกว่า 401 (หมดอายุ) ก็ค่อยสั่งลบ User ออกจาก Local Storage
    refreshMe();
  }, [refreshMe]);

  // Listen for logout events (e.g., from AxiosClient on 401)
  useEffect(() => {
    const handleLogout = () => {
      // Clear React state immediately when logout event is fired
      logout();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [logout]);

  const value: AuthContextValue = useMemo(
    () => ({
      // ส่ง token กลับไปเพื่อให้ Type เดิมยังทำงานได้
      token: tokenStorage.get(),
      user,
      isAuthenticated,
      isBootstrapping,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, isAuthenticated, isBootstrapping, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

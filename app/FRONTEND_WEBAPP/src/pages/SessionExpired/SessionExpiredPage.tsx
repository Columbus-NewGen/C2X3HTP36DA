// src/pages/SessionExpired.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage, userStorage } from "../../contexts/user.storage";
import { AlertCircle } from "lucide-react";

export default function SessionExpiredPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  const goToLogin = () => {
    tokenStorage.clear();
    userStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      goToLogin();
    }
  }, [countdown]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* ambient glow */}
      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-3xl" />

      {/* card */}
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur-md">
        {/* icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-1 ring-amber-200">
          <AlertCircle size={30} />
        </div>

        {/* title */}
        <h1 className="text-2xl font-semibold  text-neutral-900">
          เซสชันหมดอายุ
        </h1>

        {/* description */}
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          ระบบได้ออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งาน
          กรุณาเข้าสู่ระบบอีกครั้งเพื่อใช้งานต่อ
        </p>

        {/* countdown */}
        <div className="mt-7">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 3) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            กำลังพาไปหน้าเข้าสู่ระบบใน {countdown} วินาที
          </p>
        </div>

        {/* action */}
        <button
          onClick={goToLogin}
          className="mt-8 w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
        >
          ไปหน้าเข้าสู่ระบบทันที
        </button>
      </div>
    </div>
  );
}
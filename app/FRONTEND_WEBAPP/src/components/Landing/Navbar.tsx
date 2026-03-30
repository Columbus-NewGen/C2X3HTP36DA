import {
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import type { NavbarProps } from "../../types/landing.types";
import { useEffect } from "react";

export function Navbar({
  scrolled,
  isLoggedIn,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleMockAuth,
}: NavbarProps) {
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-2 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer select-none">
            <img src={"/logo-gymmate192.png"} alt="GymMate" className="h-12 w-auto" />
            <span className="text-xl font-bold  font-heading">
              GYM<span className="text-lime-600">MATE</span>
            </span>
          </div>

          {/* Desktop Menu & Auth Buttons */}
          <div className="hidden md:flex items-center gap-8">
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4 animate-fade-in">
                <span className="text-sm font-medium text-gray-500 hidden lg:block">
                  ยินดีต้อนรับ, สมาชิก
                </span>
                <button
                  onClick={() => (window.location.href = "/app")}
                  className="group flex items-center gap-2 bg-black text-white pr-4 pl-5 py-2.5 rounded-full font-semibold hover:bg-lime-400 hover:text-bold transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-lime-400/30"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </button>
                <button
                  onClick={() => handleMockAuth()}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMockAuth}
                  className="px-4 py-2 text-sm font-semibold hover:text-lime-600 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={handleMockAuth}
                  className="bg-lime-400 text-bold px-6 py-2.5 rounded-full font-bold hover:bg-lime-300 transition-all shadow-md shadow-lime-200/50 hover:shadow-lg hover:shadow-lime-300/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  สมัครสมาชิก
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-900 active:scale-95 transition-transform"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transition-all duration-500 md:hidden flex flex-col ${isMobileMenuOpen
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-full pointer-events-none"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src={"/logo-gymmate192.png"} alt="GymMate" className="h-12 w-auto" />
            <span className="text-xl font-bold ">
              GYM<span className="text-lime-600">MATE</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 gap-8">
          {isLoggedIn ? (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-base">👋</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  ยินดีต้อนรับกลับมา!
                </h3>
                <p className="text-gray-500 text-sm">พร้อมลุยวันนี้หรือยัง?</p>
              </div>

              <button
                onClick={() => (window.location.href = "/app")}
                className="w-full flex items-center justify-center gap-3 bg-black text-white p-5 rounded-2xl font-bold text-base shadow-xl shadow-lime-200 hover:scale-[1.02] transition-transform"
              >
                <LayoutDashboard className="w-6 h-6" />
                ไปที่ Dashboard
              </button>

              <button
                onClick={() => {
                  handleMockAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 text-gray-400 font-semibold hover:text-red-500 transition-colors border border-gray-100 rounded-2xl"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-slide-up">
              <button
                onClick={() => {
                  handleMockAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-lime-400 text-bold p-5 rounded-2xl font-bold text-base shadow-lg shadow-lime-300/50 hover:bg-lime-300 transition-colors flex items-center justify-center gap-3"
              >
                <UserPlus className="w-6 h-6" />
                สมัครสมาชิกใหม่
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">
                    หรือ
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  handleMockAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-white border-2 border-gray-100 text-gray-900 p-5 rounded-2xl font-bold text-base hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              >
                <LogIn className="w-6 h-6" />
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            GymMate Project &copy; {new Date().getFullYear() + 543}
          </p>
        </div>
      </div>
    </>
  );
}

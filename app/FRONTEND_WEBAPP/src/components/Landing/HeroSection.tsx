import { ArrowRight, Activity, LayoutDashboard, Users, Zap } from "lucide-react";
import { HeroShowcase } from "./HeroShowcase";
import type { HeroSectionProps } from "../../types/landing.types";

export function HeroSection({ isLoggedIn, handleMockAuth }: HeroSectionProps) {
  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden ">
      {/* Abstract Background Element (Green/Black vibe) */}
      <div className="absolute top-0 right-0 -z-10 w-full lg:w-1/2 h-full bg-linear-to-b from-lime-50/80 to-white opacity-60 rounded-bl-[5rem] lg:rounded-bl-[10rem]"></div>
      <div className="absolute top-10 right-10 lg:top-20 lg:right-20 -z-10 w-60 h-60 lg:w-72 lg:h-72 bg-lime-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6 lg:space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase  text-gray-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              YOUR SMART FITNESS BUDDY
            </div>

            <h1 className="text-3xl font-bold text-gray-900 leading-[1.1]  font-heading">
              เปลี่ยนทุกการฝึก <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-lime-600 to-lime-400">
                ให้กลายเป็นความสนุก
              </span>
            </h1>

            <p className="text-base text-gray-500 max-w-2xl lg:max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
              ยกระดับการออกกำลังกายด้วยระบบ <strong className="text-gray-900 font-bold">Gamification</strong> ให้เห็นผลจริง เข้าใจง่าย พร้อมไปถึงเป้าหมายได้ไวกว่าเดิม
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-4 justify-center lg:justify-start">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={handleMockAuth}
                    className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    เริ่มต้นใช้งานฟรี
                    <ArrowRight className="w-5 h-5 text-lime-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                  >
                    ดูฟีเจอร์ทั้งหมด
                  </button>
                </>
              ) : (
                <button
                  onClick={() => (window.location.href = "/app")}
                  className="w-full sm:w-auto px-8 py-4 bg-lime-400 text-bold rounded-2xl font-bold hover:bg-lime-300 hover:-translate-y-1 transition-all shadow-[0_10px_20px_-5px_rgba(163,230,53,0.5)] flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  ไปที่ Dashboard ของคุณ
                </button>
              )}
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-gray-500 text-xs sm:text-sm font-medium w-full">
              <div className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-gray-50/50 rounded-full border border-gray-100 hover:bg-lime-50 hover:border-lime-100 transition-colors">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime-500" />
                <span>ACSM Standard</span>
              </div>
              <div className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-gray-50/50 rounded-full border border-gray-100 hover:bg-lime-50 hover:border-lime-100 transition-colors">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime-500" />
                <span>Community Driven</span>
              </div>
              <div className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-gray-50/50 rounded-full border border-gray-100 hover:bg-lime-50 hover:border-lime-100 transition-colors">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime-500" />
                <span>Smart Gamification</span>
              </div>
            </div>
          </div>

          {/* Visual/Image Area */}
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 px-2 sm:px-0">
            <HeroShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}

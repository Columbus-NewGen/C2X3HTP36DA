import { Activity, Trophy, Flame } from "lucide-react";
import heroImg from "../../assets/fitness-tracker.png";

export function HeroShowcase() {
  return (
    <div className="relative w-full max-w-[400px] sm:max-w-[440px] lg:max-w-none mx-auto perspective-1000">
      {/* Background blobs (Softer & cleaner) */}
      <div className="absolute -top-10 -right-10 h-64 w-64 lg:h-80 lg:w-80 rounded-full bg-lime-200/30 blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-10 left-0 h-64 w-64 lg:h-80 lg:w-80 rounded-full bg-gray-200/40 blur-3xl" />

      {/* Device Mock container - adding tilt effect suggestion via CSS class later or just static nice shadow */}
      <div className="relative transition-transform duration-500 hover:scale-[1.01] hover:-rotate-1">
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[8px] border-white bg-white shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
          {/* Top Bar (Mock UI) */}
          <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <img src={"/logo-gymmate192.png"} alt="GymMate" className="h-10 w-auto" />
              <div className="leading-none">
                <div className="text-sm font-bold text-gray-900">
                  GymMate
                </div>
                <div className="text-xs sm:text-xs font-medium text-gray-400 mt-0.5">
                  Your Fitness Buddy
                </div>
              </div>
            </div>

            <div className="rounded-full bg-lime-50 border border-lime-100 px-3 py-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              <span className="text-xs font-bold text-lime-700 uppercase">
                Live
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-gray-50/50 p-4 sm:p-6 pb-8">
            {/* Media Area */}
            <div className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 group">
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={heroImg}
                  alt="GymMate showcase"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  draggable={false}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Tag inside image */}
                <div className="absolute left-3 top-3 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-1 text-xs font-bold text-white">
                  Training Mode
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-xs text-gray-300 uppercase font-semibold">
                        Current Set
                      </div>
                      <div className="text-sm font-bold">Bench Press</div>
                    </div>
                    <div className="text-base font-mono font-bold text-lime-400">
                      12
                      <span className="text-xs text-white/70 ml-0.5">reps</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-lime-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-lime-200 transition-colors group">
                <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div className="text-xs text-gray-400 font-semibold uppercase ">
                  Streak
                </div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  7{" "}
                  <span className="text-xs sm:text-xs font-medium text-gray-400">
                    Days
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-lime-200 transition-colors group">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-xs text-gray-400 font-semibold uppercase ">
                  Progress
                </div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  +12
                  <span className="text-xs sm:text-xs font-medium text-gray-400">
                    %
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-lime-200 transition-colors group">
                <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Trophy className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="text-xs text-gray-400 font-semibold uppercase ">
                  Rank
                </div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  Silver
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chips (Hidden on small mobile, visible on tablet+) */}
        <div className="absolute -left-6 top-16 hidden md:block animate-float">
          <div className="bg-white/90 backdrop-blur-md p-3 pr-5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 transform -rotate-2 hover:rotate-0 transition-transform">
            <div className="bg-black text-white p-2 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">
                Status
              </div>
              <div className="text-sm font-bold text-gray-900">
                Workout Active
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -right-8 bottom-20 hidden md:block animate-float-delayed">
          <div className="bg-white/90 backdrop-blur-md p-3 pr-5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 transform rotate-2 hover:rotate-0 transition-transform">
            <div className="bg-lime-400 text-bold p-2 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">
                Achievement
              </div>
              <div className="text-sm font-bold text-gray-900">
                New Personal Best!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

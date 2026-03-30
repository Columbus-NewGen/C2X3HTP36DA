// Dashboard Header Component
import { Calendar, Clock } from "lucide-react";
import { cn } from "../../utils/dashboard.utils";

declare global {
  interface Window {
    __ENV__?: {
      flag4?: string;
    };
  }
}

interface DashboardHeaderProps {
  gymName: string;
  today: string;
  isOpenNow: boolean;
  imageUrl: string;
}

export function DashboardHeader({
  gymName,
  today,
  isOpenNow,
  imageUrl,
}: DashboardHeaderProps) {
  return (
    <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Gym Background"
            className="h-full w-full object-cover opacity-60 transition-opacity duration-1000"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>
      {/* Header Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-10 sm:pb-16">
        <div className="mx-auto flex max-w-7xl items-end justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md transition-all",
                  isOpenNow
                    ? "bg-lime-500/90 text-white border border-lime-400/30"
                    : "bg-rose-500/90 text-white border border-rose-400/30"
                )}
              >
                <Clock size={12} strokeWidth={2.5} />
                {isOpenNow ? "เปิดทำการ" : "ปิดทำการ"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-300 text-[11px] font-bold backdrop-blur-md bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <Calendar size={12} strokeWidth={2.5} />
                {today}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-2xl">
              {gymName}
            </h1>
            <p className="text-sm font-medium text-gray-400 mt-2 flex items-center gap-2 drop-shadow-lg">
              <span className="w-2 h-2 rounded-full bg-lime-500 shadow-sm shadow-lime-500/50" />
              Admin Center — System Monitoring
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

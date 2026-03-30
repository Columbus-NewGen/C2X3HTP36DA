import { ArrowRight } from "lucide-react";
import type { QuickAction } from "../../types/dashboard.types";
import { cn } from "../../utils/dashboard.utils";

// Quick Actions Grid
interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick: (route: string) => void;
}

export function QuickActionsGrid({
  actions,
  onActionClick,
}: QuickActionsGridProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
          เมนูด่วน
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          เลือกเมนูที่ต้องการ
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onActionClick(action.route)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-2xl p-3 text-left",
              "bg-gray-50/80 hover:bg-white border border-gray-100 transition-all",
              "hover:-translate-y-1 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-base",
                action.color,
              )}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 truncate">
                {action.label}
              </span>
              {action.desc && (
                <span className="mt-0.5 block text-xs text-gray-400 truncate">
                  {action.desc}
                </span>
              )}
            </div>

            <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>ไปยังหน้า</span>
              <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

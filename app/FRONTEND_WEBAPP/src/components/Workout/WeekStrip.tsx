import { memo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, toYYYYMMDD, addDays, getWeekDates, formatMonthYear } from "../../utils/workout.utils";

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  workoutsByDate: Record<string, boolean>;
  sticky?: boolean;
}

const DAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function WeekStripInner({
  selectedDate,
  onSelectDate,
  workoutsByDate,
  sticky = true,
}: WeekStripProps) {
  const weekDates = getWeekDates(selectedDate);

  const goPrev = useCallback(() => {
    onSelectDate(addDays(selectedDate, -7));
  }, [selectedDate, onSelectDate]);

  const goNext = useCallback(() => {
    onSelectDate(addDays(selectedDate, 7));
  }, [selectedDate, onSelectDate]);

  const selectToday = useCallback(() => {
    onSelectDate(new Date());
  }, [onSelectDate]);

  const todayStr = toYYYYMMDD(new Date());
  const monthLabel = formatMonthYear(selectedDate);

  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300",
        sticky && "sticky top-0 z-30"
      )}
    >
      {/* Header: month + today button */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest leading-none mb-1">
            Workout Schedule
          </p>
          <p className="text-sm font-bold text-gray-900 leading-none">
            {monthLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={selectToday}
          className="group relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 px-4 py-1.5 text-xs font-bold text-gray-600 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700 transition-all active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
            วันนี้
          </span>
        </button>
      </div>

      {/* Date strip */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 active:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all shrink-0 active:scale-90"
            aria-label="สัปดาห์ก่อน"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 flex justify-between gap-1">
            {weekDates.map((d) => {
              const key = toYYYYMMDD(d);
              const isSelected = toYYYYMMDD(selectedDate) === key;
              const isToday = key === todayStr;
              const hasWorkout = workoutsByDate[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(d)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl relative transition-all duration-300",
                    isSelected
                      ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-[1.05] z-10"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                    isToday && !isSelected && "bg-lime-50 text-lime-700 font-bold"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tight",
                    isSelected ? "text-lime-400" : "text-inherit"
                  )}>
                    {DAY_LABELS[d.getDay()]}
                  </span>
                  <span className="text-sm font-bold mt-0.5">
                    {d.getDate()}
                  </span>

                  {hasWorkout && (
                    <span
                      className={cn(
                        "absolute bottom-2 w-1 h-1 rounded-full",
                        isSelected ? "bg-white" : "bg-lime-500"
                      )}
                    />
                  )}

                  {isToday && !isSelected && (
                    <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-lime-500" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 active:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all shrink-0 active:scale-90"
            aria-label="สัปดาห์ถัดไป"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export const WeekStrip = memo(WeekStripInner);

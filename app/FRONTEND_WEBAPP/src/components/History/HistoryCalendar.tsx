import { memo, useMemo, useState } from "react";
import type { WorkoutLog, ScheduledWorkout } from "../../types/workout.types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getThaiMonthYear } from "../../utils/workoutHistory.utils";
import { cn } from "../../utils/cn";

interface HistoryCalendarProps {
  logs: WorkoutLog[];
  scheduled: ScheduledWorkout[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onGoToToday: () => void;
}

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export const HistoryCalendar = memo(
  ({ logs, scheduled, selectedDate, onSelectDate, onGoToToday }: HistoryCalendarProps) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const statusMap = useMemo(() => {
      const map: Record<string, {
        hasLog: boolean;
        primaryStatus: string;
        isScheduled: boolean;
      }> = {};

      logs.forEach((l) => {
        const date = new Date(l.workout_date).toISOString().split("T")[0];
        if (!map[date]) map[date] = { hasLog: true, primaryStatus: 'COMPLETED', isScheduled: false };
        else map[date].hasLog = true;
      });

      scheduled.forEach((s) => {
        const date = s.scheduled_date;
        if (!map[date]) {
          map[date] = { hasLog: s.status === 'COMPLETED', primaryStatus: s.status, isScheduled: s.status === 'SCHEDULED' };
        } else {
          if (s.status === 'SCHEDULED') map[date].isScheduled = true;
          if (s.status !== 'SCHEDULED' && map[date].primaryStatus === 'SCHEDULED') {
            map[date].primaryStatus = s.status;
          }
        }
      });

      return map;
    }, [logs, scheduled]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();

    const prevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((v) => v - 1);
      } else setViewMonth((v) => v - 1);
    };
    const nextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((v) => v + 1);
      } else setViewMonth((v) => v + 1);
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400">
              <CalendarIcon size={14} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-neutral-900 leading-none">
                {getThaiMonthYear(viewMonth, viewYear)}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">สำเร็จ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">ตาราง</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const now = new Date();
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                onGoToToday();
              }}
              className="px-2 py-0.5 text-[9px] font-bold bg-neutral-50 text-neutral-600 rounded-lg border border-neutral-100 hover:bg-neutral-100 transition-colors uppercase"
            >
              วันนี้
            </button>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-neutral-50 rounded-lg text-neutral-400 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-neutral-50 rounded-lg text-neutral-400 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold text-neutral-300 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const info = statusMap[dateStr];
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;

            const hasActivity = info?.hasLog || info?.isScheduled || (info?.primaryStatus && info.primaryStatus !== 'SCHEDULED');

            return (
              <button
                key={i}
                onClick={() => hasActivity ? onSelectDate(isSelected ? null : dateStr) : null}
                className={cn(
                  "relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all duration-200 border",
                  isSelected
                    ? "bg-neutral-900 border-neutral-900 text-white font-bold shadow-md"
                    : info?.hasLog
                      ? "bg-lime-50 border-lime-100 text-lime-700 font-bold"
                      : info?.isScheduled
                        ? "bg-blue-50/50 border-blue-50 text-blue-600 font-bold"
                        : "bg-transparent border-transparent text-neutral-400 font-semibold hover:bg-neutral-50",
                  isToday && !isSelected && "ring-1 ring-lime-500 ring-offset-2 z-10",
                )}
              >
                <span className="text-[11px]">{day}</span>
                {!isSelected && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {info?.hasLog && <div className="w-1 h-1 rounded-full bg-lime-500" />}
                    {info?.isScheduled && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                    {info?.primaryStatus === 'MISSED' && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => onSelectDate(null)}
              className="text-[10px] font-bold text-white bg-gray-900 px-5 py-2 rounded-xl uppercase  hover:bg-gray-800 transition-colors shadow-sm"
            >
              ล้างการเลือก
            </button>
          </div>
        )}
      </div>
    );
  },
);

HistoryCalendar.displayName = "HistoryCalendar";

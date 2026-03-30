import { memo } from "react";
import type { WorkoutLog, ScheduledWorkout } from "../../types/workout.types";
import {
  formatThaiDate,
  getThaiDayName,
} from "../../utils/workoutHistory.utils";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutDateGroupProps {
  date: string;
  logs: WorkoutLog[];
  scheduled: ScheduledWorkout[];
  onSelect: (log: WorkoutLog) => void;
}

export const WorkoutDateGroup = memo(
  ({ date, logs, scheduled, onSelect }: WorkoutDateGroupProps) => {
    return (
      <div className="space-y-6">
        {/* Cleaner Date Header */}
        <div className="flex items-end gap-4 px-1">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-neutral-900 leading-none ">
              {getThaiDayName(date)}
            </h2>
            <div className="text-[10px] font-bold text-neutral-400 mt-1.5 uppercase ">
              {formatThaiDate(date, { day: "numeric", month: "long" })}
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent mb-1" />
          <div className="flex-none text-[10px] font-bold text-lime-600 bg-lime-50 border border-lime-100/50 px-3 py-1 rounded-full mb-0.5">
            {logs.length + scheduled.length} กิจกรรม
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {logs.map((log) => (
            <WorkoutCard key={`log-${log.id}`} data={log} onSelect={onSelect} type="log" />
          ))}
          {scheduled.map((s) => (
            <WorkoutCard key={`sched-${s.id}`} data={s} onSelect={() => { }} type="scheduled" />
          ))}
        </div>
      </div>
    );
  },
);

WorkoutDateGroup.displayName = "WorkoutDateGroup";

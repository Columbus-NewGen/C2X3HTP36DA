import { memo } from "react";
import { formatThaiDate } from "../../utils/workoutHistory.utils";
import { Clock } from "lucide-react";
import { Pill } from "../ui";

interface WorkoutHeaderProps {
  sessionName?: string;
  workoutDate: string;
  durationMinutes: number;
  hasSession: boolean;
}

export const WorkoutHeader = memo(
  ({
    sessionName,
    workoutDate,
    durationMinutes,
    hasSession,
  }: WorkoutHeaderProps) => {
    return (
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Pill
              tone={hasSession ? "lime" : "neutral"}
              className="text-xs font-bold uppercase  px-2 h-5 border-none"
            >
              {hasSession ? "ตามโปรแกรม" : "อิสระ"}
            </Pill>
            <span className="text-xs font-bold text-neutral-400 uppercase ">
              {formatThaiDate(workoutDate)}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 truncate leading-tight">
            {sessionName || "Freestyle Workout"}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Clock size={14} className="text-neutral-300" />
            <span className="text-sm font-bold tabular-nums">
              {durationMinutes > 0
                ? `${durationMinutes} นาที`
                : "ไม่ได้บันทึกเวลา"}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

WorkoutHeader.displayName = "WorkoutHeader";

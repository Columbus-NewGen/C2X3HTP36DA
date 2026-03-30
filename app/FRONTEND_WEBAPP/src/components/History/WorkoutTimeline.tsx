import { memo, useMemo } from "react";
import type { WorkoutLog, ScheduledWorkout } from "../../types/workout.types";
import { WorkoutDateGroup } from "./WorkoutDateGroup";
import { Activity } from "lucide-react";

interface WorkoutTimelineProps {
  logs: WorkoutLog[];
  scheduled: ScheduledWorkout[];
  onSelect: (log: WorkoutLog) => void;
  selectedDate: string | null;
  filter: 'ALL' | 'DONE' | 'PLAN';
}

export const WorkoutTimeline = memo(
  ({ logs, scheduled, onSelect, selectedDate, filter }: WorkoutTimelineProps) => {
    const combinedData = useMemo(() => {
      const groups: Record<string, { logs: WorkoutLog[]; scheduled: ScheduledWorkout[] }> = {};

      if (filter !== 'PLAN') {
        logs.forEach((log) => {
          const d = new Date(log.workout_date).toISOString().split("T")[0];
          if (!groups[d]) groups[d] = { logs: [], scheduled: [] };
          groups[d].logs.push(log);
        });
      }

      if (filter !== 'DONE') {
        scheduled.forEach((s) => {
          const d = s.scheduled_date;
          if (!groups[d]) groups[d] = { logs: [], scheduled: [] };
          if (s.status === 'COMPLETED' && s.workout_log) {
            const exists = groups[d].logs.some(l => l.id === s.workout_log?.id);
            if (!exists) groups[d].logs.push(s.workout_log);
          } else if (s.status !== 'COMPLETED') {
            groups[d].scheduled.push(s);
          }
        });
      }

      let entries = Object.entries(groups).map(([date, data]) => ({
        date,
        ...data
      }));

      // Filter by selected date if targetted
      if (selectedDate) {
        entries = entries.filter(e => e.date === selectedDate);
      }

      // Final cleanup: if entry has no logs or scheduled after filtering, remove it
      entries = entries.filter(e => e.logs.length > 0 || e.scheduled.length > 0);

      return entries.sort((a, b) => {
        if (filter === 'PLAN') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
      });
    }, [logs, scheduled, selectedDate, filter]);

    if (combinedData.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center text-center px-6 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
          <Activity size={32} className="text-gray-200 mb-4" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-gray-500 uppercase ">
            ไม่พบกิจกรรม
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-2">
            ลองปรับแต่งตัวกรองหรือเลือกวันอื่นเพื่อดูข้อมูล
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-10 pt-4 pb-20">
        {combinedData.map((group) => (
          <WorkoutDateGroup
            key={group.date}
            date={group.date}
            logs={group.logs}
            scheduled={group.scheduled}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  },
);

WorkoutTimeline.displayName = "WorkoutTimeline";

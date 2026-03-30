import { memo } from "react";
import { motion } from "framer-motion";
import { calculateCompletionPercent } from "../../utils/workoutHistory.utils";

interface WorkoutCompletionBarProps {
  completeness?: {
    total_prescribed: number;
    completed_slots: number;
    extra_exercises: number;
  };
}

export const WorkoutCompletionBar = memo(
  ({ completeness }: WorkoutCompletionBarProps) => {
    if (!completeness || completeness.total_prescribed === 0) return null;

    const percent = calculateCompletionPercent(completeness);

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-neutral-400 uppercase ">
            ความสำเร็จของเป้าหมาย
          </span>
          <span className="text-xs font-bold text-lime-600">
            {completeness.completed_slots}/{completeness.total_prescribed} ท่า (
            {percent}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className="h-full bg-lime-500 rounded-full"
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  },
);

WorkoutCompletionBar.displayName = "WorkoutCompletionBar";

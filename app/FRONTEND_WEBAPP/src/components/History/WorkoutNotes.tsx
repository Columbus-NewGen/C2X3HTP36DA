import { memo, useState } from "react";
import { StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../utils/cn";

interface WorkoutNotesProps {
  notes?: string | null;
}

export const WorkoutNotes = memo(({ notes }: WorkoutNotesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!notes) return null;

  return (
    <div className="mt-4 pt-4 border-t border-neutral-50">
      <div
        className="flex items-start gap-2 cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        <StickyNote size={14} className="text-neutral-300 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs text-neutral-500 leading-relaxed font-medium transition-all duration-300",
              !isExpanded && "line-clamp-1",
            )}
          >
            {notes}
          </p>
        </div>
        <div className="shrink-0 text-neutral-300 group-hover:text-neutral-500 transition-colors">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
    </div>
  );
});

WorkoutNotes.displayName = "WorkoutNotes";

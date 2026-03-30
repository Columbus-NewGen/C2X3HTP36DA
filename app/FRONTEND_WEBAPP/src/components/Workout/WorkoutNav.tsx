import { memo, useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/workout.utils";

const TABS = [
  { to: "/workout/today", label: "Today" },
  { to: "/workout/calendar", label: "Calendar" },
  { to: "/workout/history", label: "History" },
] as const;

function WorkoutNavInner() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = TABS.findIndex((t) => t.to === location.pathname);

  useEffect(() => {
    const update = () => {
      const el = activeIndex >= 0 ? tabRefs.current[activeIndex] : null;
      if (el && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const tab = el.getBoundingClientRect();
        setIndicatorStyle({
          left: tab.left - container.left,
          width: tab.width,
        });
      }
    };
    update();
    const t = setTimeout(update, 50);
    return () => clearTimeout(t);
  }, [activeIndex, location.pathname]);

  return (
    <nav
      ref={containerRef}
      className="sticky top-0 z-20 flex border-b border-gray-100 bg-white/95 backdrop-blur-sm"
      aria-label="Workout sections"
    >
      <div className="relative flex flex-1">
        {TABS.map(({ to, label }, i) => (
          <NavLink
            key={to}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex-1 py-4 text-center text-sm font-medium transition-colors duration-200 z-10",
                isActive ? "text-lime-600 font-bold" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            {label}
          </NavLink>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-lime-500 rounded-full"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width || (activeIndex >= 0 ? "33.333%" : 0),
            transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </nav>
  );
}

export const WorkoutNav = memo(WorkoutNavInner);

// Calendar component for displaying workout attendance

interface CalendarProps {
    year: number;
    month: number; // 0-11
    workoutDates: Set<string>; // YYYY-MM-DD format
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({ year, month, workoutDates }: CalendarProps) {
    // Get first day of month (0 = Sunday)
    const firstDay = new Date(year, month, 1).getDay();

    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate calendar grid
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Add remaining days to last week
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    const formatDate = (day: number) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">
                {MONTHS[month]} {year}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_SHORT.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid gap-1">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {week.map((day, dayIdx) => {
                            if (day === null) {
                                return <div key={dayIdx} className="aspect-square" />;
                            }

                            const dateStr = formatDate(day);
                            const hasWorkout = workoutDates.has(dateStr);
                            const now = new Date();
                            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            const isToday = todayStr === dateStr;

                            return (
                                <div
                                    key={day}
                                    title={hasWorkout ? `${dateStr} - Worked out` : dateStr}
                                    className={`
                    aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                    ${hasWorkout ? 'bg-lime-500 text-white' : 'bg-gray-50 text-gray-700'}
                    ${isToday ? 'ring-2 ring-lime-600 ring-offset-1' : ''}
                    ${!hasWorkout && 'hover:bg-gray-100'}
                    transition-colors cursor-default
                  `}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-lime-500" />
                    <span>Worked out</span>
                </div>
                {Array.from(workoutDates).length > 0 && (
                    <span className="font-semibold text-gray-700">
                        {Array.from(workoutDates).length} days this month
                    </span>
                )}
            </div>
        </div>
    );
}

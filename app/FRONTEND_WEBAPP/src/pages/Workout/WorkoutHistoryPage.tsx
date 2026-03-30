import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { workoutsApi } from "../../services/workoutsApi";
import { userProgramsApi } from "../../services/userProgramsApi";
import { WorkoutLogDetailSheet } from "../../components/Workout/WorkoutLogDetailSheet";
import { PageLoader } from "../../components/ui";
import { History } from "lucide-react";
import type { WorkoutLog } from "../../types/workout.types";
import { cn } from "../../utils/cn";

// Components
import { HistorySummary } from "../../components/History/HistorySummary";
import { HistoryCalendar } from "../../components/History/HistoryCalendar";
import { WorkoutTimeline } from "../../components/History/WorkoutTimeline";

const PAST_DAYS = 90;

export default function WorkoutHistoryPage() {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'DONE' | 'PLAN'>('ALL');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CALENDAR' | 'LOGS'>('OVERVIEW');

  const goToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setActiveTab('CALENDAR');
  }, []);

  const { startDate, historyEndDate, calendarEndDate } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - PAST_DAYS);

    const histEnd = new Date(today);

    const calEnd = new Date(today);
    calEnd.setDate(today.getDate() + 45);

    return {
      startDate: start.toISOString().split("T")[0],
      historyEndDate: histEnd.toISOString().split("T")[0],
      calendarEndDate: calEnd.toISOString().split("T")[0],
    };
  }, []);

  const logsQ = useQuery({
    queryKey: ["workout-logs", userId, startDate, historyEndDate],
    queryFn: () => workoutsApi.getLogs(userId!, startDate, historyEndDate),
    enabled: !!userId,
  });

  const scheduledQ = useQuery({
    queryKey: ["scheduled-history", userId, startDate, calendarEndDate],
    queryFn: () => workoutsApi.getScheduled(userId!, startDate, calendarEndDate),
    enabled: !!userId,
  });

  const programsQ = useQuery({
    queryKey: ['user-programs', userId],
    queryFn: () => userProgramsApi.getByUserId(userId ?? 0),
    enabled: !!userId,
  });

  const activeProgramIds = useMemo(() => {
    return (programsQ.data || [])
      .filter((p) => p.status === 'ACTIVE')
      .map((p) => p.id);
  }, [programsQ.data]);

  const logs = logsQ.data || [];
  const scheduled = useMemo(() => {
    if (activeProgramIds.length === 0) return [];
    return (scheduledQ.data || []).filter((w) =>
      activeProgramIds.includes(w.user_program_id)
    );
  }, [scheduledQ.data, activeProgramIds]);

  const isLoading = logsQ.isLoading || scheduledQ.isLoading || programsQ.isLoading;
  const isError = logsQ.isError || scheduledQ.isError;
  const refetch = () => {
    logsQ.refetch();
    scheduledQ.refetch();
    programsQ.refetch();
  };

  const handleSelectLog = useCallback((log: WorkoutLog) => {
    setSelectedLog(log);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-neutral-50 pb-32">
        {/* Premium Tab Navigation */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between h-16">
            <div className="flex items-center gap-1 h-full">
              {(['OVERVIEW', 'CALENDAR', 'LOGS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative h-full px-5 flex items-center transition-all duration-300",
                    activeTab === tab ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  <span className="text-md font-semibold uppercase  z-10">
                    {tab === 'OVERVIEW' ? 'สรุปผล' : tab === 'CALENDAR' ? 'ปฏิทิน' : 'ประวัติ'}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabHistory"
                      className="absolute bottom-0 left-2 right-2 h-1 bg-lime-500 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-neutral-400 hover:bg-neutral-50 hover:text-lime-500 transition-all active:scale-90"
            >
              <History size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-8">
          {isLoading ? (
            <div className="h-[40vh] flex items-center justify-center">
              <PageLoader variant="inline" />
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
              <button
                onClick={() => refetch()}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'OVERVIEW' && (
                  <div className="space-y-8">
                    <HistorySummary logs={logs} pastDays={PAST_DAYS} />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase ">
                          กิจกรรมล่าสุด
                        </h3>
                        <button
                          onClick={() => setActiveTab('LOGS')}
                          className="text-xs font-semibold text-lime-600 hover:underline"
                        >
                          ดูทั้งหมด
                        </button>
                      </div>
                      <WorkoutTimeline
                        logs={logs.slice(0, 3)}
                        scheduled={[]}
                        onSelect={handleSelectLog}
                        selectedDate={null}
                        filter="DONE"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'CALENDAR' && (
                  <div>
                    <HistoryCalendar
                      logs={logs}
                      scheduled={scheduled}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      onGoToToday={goToToday}
                    />

                    {selectedDate && (
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-2 mb-4 px-1">
                          <div className="w-1 h-3 bg-lime-500 rounded-full" />
                          <h2 className="text-sm font-bold text-gray-900">
                            กิจกรรมวันที่ {selectedDate}
                          </h2>
                        </div>
                        <WorkoutTimeline
                          logs={logs}
                          scheduled={scheduled}
                          onSelect={handleSelectLog}
                          selectedDate={selectedDate}
                          filter="ALL"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'LOGS' && (
                  <div>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h2 className="text-md font-semibold text-gray-900 uppercase">
                        บันทึกการฝึกทั้งหมด
                      </h2>

                      <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                        {(['ALL', 'DONE', 'PLAN'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                              filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                            )}
                          >
                            {f === 'ALL' ? 'ทั้งหมด' : f === 'DONE' ? 'สำเร็จ' : 'ตาราง'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <WorkoutTimeline
                      logs={logs}
                      scheduled={scheduled}
                      onSelect={handleSelectLog}
                      selectedDate={null}
                      filter={filter}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <WorkoutLogDetailSheet
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}

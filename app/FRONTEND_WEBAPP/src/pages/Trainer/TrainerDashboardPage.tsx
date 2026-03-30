import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, UserRoundSearch } from "lucide-react";
import { trainerApi } from "../../services/TrainerAPI";
import type { TraineeDashboardItem } from "../../types/trainer.types";
import { PageLoader, useToasts, ToastContainer } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { TraineeModal, TraineeCard, ActivityFeed } from "../../components/Trainer";

export default function TrainerDashboardPage() {
  const { toasts, removeToast } = useToasts();
  const [selectedTrainee, setSelectedTrainee] =
    useState<TraineeDashboardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["trainer-dashboard", user?.id],
    queryFn: () => trainerApi.getDashboard(),
  });

  if (isLoading) return <PageLoader message="กำลังโหลดข้อมูลแดชบอร์ด..." />;

  const trainees = dashboard?.trainees || [];
  const filteredTrainees = trainees.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const activities = dashboard?.recent_activity || [];
  const filteredActivities = activities.filter((act) =>
    act.trainee_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalCount = dashboard?.total_trainees ?? trainees.length;
  const activeCount = dashboard?.active_trainees ?? trainees.length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Control Panel
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-6">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Trainer <span className="text-lime-500">Dashboard</span>
              </h1>
              <div className="flex items-center gap-4 pb-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-900">
                    {totalCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Accounts
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-lime-600">
                    {activeCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-lime-500 transition-colors" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="ค้นหาชื่อสมาชิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-lime-100 focus:border-lime-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trainees List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">
                สมาชิกในการดูแล
              </h3>
              <div className="h-px flex-1 bg-slate-200/60" />
              <span className="text-xs font-bold text-slate-300 tabular-nums">
                {filteredTrainees.length} รายการ
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTrainees.map((t) => (
                <TraineeCard
                  key={t.id}
                  trainee={t}
                  onClick={() => {
                    setSelectedTrainee(t);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
            {!filteredTrainees.length && (
              <div className="py-20 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <UserRoundSearch className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-slate-400 font-bold text-sm">
                  ไม่พบสมาชิกที่ตรงกับการค้นหา
                </p>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">
                  กิจกรรมล่าสุด
                </h3>
                <div className="h-px flex-1 bg-slate-200/60" />
              </div>
              <ActivityFeed activities={filteredActivities} />
            </div>
          </div>
        </div>
      </div>

      <TraineeModal
        isOpen={isModalOpen}
        trainee={selectedTrainee}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrainee(null);
        }}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

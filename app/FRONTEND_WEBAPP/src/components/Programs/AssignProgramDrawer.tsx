import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Drawer, Field, Input, Textarea, Button } from "../ui";
import { getNextMondayYmd } from "../../utils/programs.utils";
import { cn } from "../../utils/cn";
import type {
  AssignFormData,
  AssignFormErrors,
  ProgramDisplay,
} from "../../utils/programs.utils";
import type { ProgramDetail, ProgramDetailSession } from "../../types/program.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns map of dateStr -> session names occurring on that date.
 *  Each session repeats every week for durationWeeks.
 *  day_of_week (0-6) = position within the 7-day window starting from startDate.
 */
function buildSessionMap(
  startDate: string,
  sessions: ProgramDetailSession[],
  durationWeeks: number,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!startDate || !sessions.length) return map;

  // Use noon to avoid DST/timezone boundary issues
  const start = new Date(startDate + "T12:00:00");

  for (let week = 0; week < durationWeeks; week++) {
    for (const session of sessions) {
      // day_of_week and day_number are both 1-indexed, so subtract 1 for the offset
      // day_of_week=1 → offset 0 (same day as startDate)
      const dayInWindow = session.day_of_week != null
        ? session.day_of_week - 1
        : (session.day_number - 1) % 7;
      const d = new Date(start);
      d.setDate(start.getDate() + week * 7 + dayInWindow);
      const key = toYmd(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(session.session_name);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Mini calendar
// ---------------------------------------------------------------------------

const DAY_HEADERS = ["อา", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

interface SessionCalendarProps {
  startDate: string;
  sessions: ProgramDetailSession[];
  durationWeeks: number;
}

function SessionCalendar({ startDate, sessions, durationWeeks }: SessionCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date(startDate + "T12:00:00"));

  // Follow startDate changes
  useEffect(() => {
    if (startDate) setViewDate(new Date(startDate + "T12:00:00"));
  }, [startDate]);

  const sessionMap = useMemo(
    () => buildSessionMap(startDate, sessions, durationWeeks),
    [startDate, sessions, durationWeeks],
  );

  const todayStr = toYmd(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthLabel = viewDate.toLocaleString("th-TH", {
    month: "long",
    year: "numeric",
  });

  // Build grid cells (null = empty leading cell)
  const cells: Array<{ date: Date; dateStr: string } | null> = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), dateStr: toYmd(new Date(year, month, d)) });
  }

  const programStart = startDate ? new Date(startDate + "T12:00:00") : null;

  const totalSessions = sessions.length;
  const sessionDaysInView = cells.filter(
    (c) => c && sessionMap.has(c.dateStr),
  ).length;

  return (
    <div className="rounded-xl border border-lime-100 bg-white p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-gray-700">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-gray-300 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;

          const { date, dateStr } = cell;
          const isSession = sessionMap.has(dateStr);
          const isStart = dateStr === startDate;
          const isToday = dateStr === todayStr;
          const sessionNames = sessionMap.get(dateStr) ?? [];

          // Which 7-day window does this date fall in?
          const daysFromStart = programStart
            ? Math.round((date.getTime() - programStart.getTime()) / 86400000)
            : null;
          const windowIndex =
            daysFromStart != null &&
            daysFromStart >= 0 &&
            daysFromStart < durationWeeks * 7
              ? Math.floor(daysFromStart / 7)
              : null;
          const inRange = windowIndex != null;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center py-0.5",
                // Alternating subtle band per 7-day window
                inRange && windowIndex! % 2 === 0 && "bg-lime-50",
                inRange && windowIndex! % 2 === 1 && "bg-gray-50",
              )}
            >
              <div
                title={isSession ? sessionNames.join(", ") : undefined}
                className={cn(
                  "relative flex items-center justify-center rounded-full",
                  "w-7 h-7 text-[11px] font-medium transition-colors cursor-default",
                  isSession
                    ? "bg-lime-400 text-white font-bold"
                    : isToday
                      ? "bg-gray-200 text-gray-800 font-semibold"
                      : inRange
                        ? "text-gray-600"
                        : "text-gray-300",
                  isStart && "ring-2 ring-lime-600 ring-offset-1",
                )}
              >
                {date.getDate()}
                {isSession && sessionNames.length > 1 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-lime-700 text-white text-[8px] flex items-center justify-center leading-none font-bold">
                    {sessionNames.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: stats + legend */}
      <div className="border-t border-gray-50 pt-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-lime-400" />
            <span className="text-[10px] text-gray-400">วันออกกำลังกาย</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full border-2 border-lime-600" />
            <span className="text-[10px] text-gray-400">วันเริ่มต้น</span>
          </div>
        </div>
        {sessionDaysInView > 0 && (
          <span className="text-[10px] text-lime-600 font-bold">
            {sessionDaysInView} / {totalSessions} วัน
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Drawer
// ---------------------------------------------------------------------------

interface AssignProgramDrawerProps {
  open: boolean;
  assignProgram: ProgramDisplay | null;
  assignForm: AssignFormData;
  assignErrors: AssignFormErrors;
  submitting: boolean;
  lookedUpUser: any;
  isLookingUpUser: boolean;
  programDetail: ProgramDetail | null;
  loadingDetail?: boolean;
  /** เมื่อเป็น true = สมาชิกเลือกใช้โปรแกรมเอง ไม่แสดงช่อง User ID */
  selfAssign?: boolean;
  onClose: () => void;
  onChangeAssignForm: (patch: Partial<AssignFormData>) => void;
  onSubmit: () => void;
  onCloneAndAssign: () => void;
}

export function AssignProgramDrawer({
  open,
  assignProgram,
  assignForm,
  assignErrors,
  submitting,
  lookedUpUser,
  isLookingUpUser,
  programDetail,
  loadingDetail,
  selfAssign = false,
  onClose,
  onChangeAssignForm,
  onSubmit,
  onCloneAndAssign,
}: AssignProgramDrawerProps) {
  const hasSessions =
    programDetail && programDetail.sessions && programDetail.sessions.length > 0;

  return (
    <Drawer
      open={open}
      title={
        selfAssign
          ? assignProgram
            ? `ใช้โปรแกรมนี้ • ${assignProgram.name}`
            : "ใช้โปรแกรมนี้"
          : assignProgram
            ? `มอบหมายโปรแกรมให้ผู้ใช้ • ${assignProgram.name}`
            : "มอบหมายโปรแกรมให้ผู้ใช้"
      }
      subtitle={
        selfAssign
          ? "เลือกสัปดาห์และวันเริ่มต้น โปรแกรมจะเริ่มนับตามตารางจากวันที่เลือก"
          : "ระบุผู้ใช้และวันที่เริ่มต้นสำหรับโปรแกรมนี้"
      }
      onClose={onClose}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            loading={submitting}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            {selfAssign ? "ใช้โปรแกรมนี้" : "มอบหมายโปรแกรมให้ผู้ใช้"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {assignErrors._general && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-800 flex-1">
                {assignErrors._general}
              </div>
            </div>
            {!selfAssign && assignErrors._general.toLowerCase().includes("already") && (
              <div className="mt-3 pt-3 border-t border-rose-200">
                <p className="text-xs text-rose-700 mb-2">
                  ผู้ใช้นี้มีโปรแกรมเดิมอยู่แล้ว
                  คุณต้องการสร้างเป็นรายการใหม่เพื่อมอบหมายหรือไม่?
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={onCloneAndAssign}
                  disabled={submitting}
                  loading={submitting}
                >
                  สร้างรายการใหม่และมอบหมายทันที
                </Button>
              </div>
            )}
          </div>
        )}

        {!selfAssign && (
          <>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2.5">
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="text-xs font-medium text-gray-500 leading-normal">
                จำกัดเฉพาะ{" "}
                <span className="text-gray-900 font-bold">Trainer / Admin</span>{" "}
                เท่านั้น ตรวจสอบ User ID ได้ที่หน้าจัดการผู้ใช้
              </div>
            </div>

            <Field
              label="User ID"
              hint="จำเป็น • ใช้ ID จากหน้า Users"
              required
              error={assignErrors.userId}
            >
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={assignForm.userId}
                  onChange={(e) => onChangeAssignForm({ userId: e.target.value })}
                  placeholder="เช่น 101"
                  disabled={submitting}
                />
                {lookedUpUser && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-lime-50 border border-lime-100 animate-in fade-in slide-in-from-top-1">
                    <div className="h-6 w-6 rounded-full bg-lime-500 flex items-center justify-center text-white">
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-lime-600 uppercase mb-0.5">
                        Verified User
                      </p>
                      <p className="text-xs font-bold text-lime-900 truncate">
                        {lookedUpUser.name}
                      </p>
                    </div>
                  </div>
                )}
                {isLookingUpUser && (
                  <div className="flex items-center gap-2 px-3 py-1">
                    <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">
                      กำลังตรวจสอบ ID...
                    </span>
                  </div>
                )}
              </div>
            </Field>
          </>
        )}

        <Field
          label="ชื่อโปรแกรมสำหรับผู้ใช้"
          hint="สามารถแก้ชื่อให้เฉพาะเจาะจงผู้ใช้ได้"
          required
          error={assignErrors.programName}
        >
          <Input
            type="text"
            value={assignForm.programName}
            onChange={(e) =>
              onChangeAssignForm({ programName: e.target.value })
            }
            placeholder="เช่น โปรแกรม 4 สัปดาห์สำหรับคุณ A"
            disabled={submitting}
          />
        </Field>

        <Field
          label="วันที่เริ่มต้น"
          required
          error={assignErrors.startDate}
          hint="โปรแกรมจะเริ่มนับวันตามตารางที่วางไว้จากวันที่เลือก"
        >
          <div className="space-y-3">
            <Input
              type="date"
              value={assignForm.startDate}
              onChange={(e) => onChangeAssignForm({ startDate: e.target.value })}
              disabled={submitting}
              className="w-full"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChangeAssignForm({ startDate: getNextMondayYmd() })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lime-100 bg-lime-50 text-[11px] font-bold text-lime-700 hover:bg-lime-100 transition-colors"
                disabled={submitting}
              >
                <Sparkles size={12} />
                เริ่มวันจันทร์หน้า
              </button>

              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const y = today.getFullYear();
                  const m = String(today.getMonth() + 1).padStart(2, "0");
                  const d = String(today.getDate()).padStart(2, "0");
                  onChangeAssignForm({ startDate: `${y}-${m}-${d}` });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={submitting}
              >
                <Calendar size={12} />
                เริ่มวันนี้
              </button>
            </div>

            {/* Session calendar preview */}
            {assignForm.startDate && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  ตารางวันออกกำลังกาย
                </p>
                {loadingDetail ? (
                  <div className="flex items-center gap-2 px-3 py-4 rounded-xl border border-gray-100 bg-gray-50">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">กำลังโหลดตาราง...</span>
                  </div>
                ) : hasSessions ? (
                  <SessionCalendar
                    startDate={assignForm.startDate}
                    sessions={programDetail!.sessions}
                    durationWeeks={assignProgram?.durationWeeks ?? 1}
                  />
                ) : (
                  <div className="px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-400">
                    โปรแกรมนี้ยังไม่มีวันฝึกที่กำหนด
                  </div>
                )}
              </div>
            )}
          </div>
        </Field>

        <Field label="หมายเหตุเพิ่มเติม" hint="ไม่บังคับ">
          <Textarea
            rows={3}
            value={assignForm.notes}
            onChange={(e) => onChangeAssignForm({ notes: e.target.value })}
            placeholder="เช่น ให้โฟกัสท่าดันมากขึ้นในสัปดาห์แรก..."
            disabled={submitting}
          />
        </Field>
      </div>
    </Drawer>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  Trash2,
  X,
  Minus,
  Loader2,
  Clock,
} from "lucide-react";
import type { WeightHistoryResponse } from "../../types/user.types";

interface WeightTrackingSectionProps {
  weightData?: WeightHistoryResponse;
  isLoading: boolean;
  onCreateWeight: (data: {
    weight_kg: number;
    recorded_at: string;
    note?: string;
  }) => void;
  onDeleteWeight: (id: number) => void;
  isCreating: boolean;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    "th-TH",
    { day: "numeric", month: "short" },
  );
}

function WeightChart({
  entries,
}: {
  entries: { weight_kg: number; recorded_at: string }[];
}) {
  if (entries.length < 2) return null;
  const sorted = [...entries].reverse();
  const W = 260;
  const H = 140;
  const PAD = 14;
  const weights = sorted.map((e) => e.weight_kg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const rng = max - min || 1;
  const x = (i: number) =>
    PAD + (i / Math.max(sorted.length - 1, 1)) * (W - PAD * 2);
  const y = (w: number) => PAD + ((max - w) / rng) * (H - PAD * 2);

  const pathD = sorted.reduce((acc, e, i) => {
    const px = x(i);
    const py = y(e.weight_kg);
    if (i === 0) return `M ${px} ${py}`;
    const ppx = x(i - 1);
    const ppy = y(sorted[i - 1].weight_kg);
    const cx = (ppx + px) / 2;
    return `${acc} C ${cx} ${ppy}, ${cx} ${py}, ${px} ${py}`;
  }, "");

  const fillD = `${pathD} L ${x(sorted.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  const isUp = weights[weights.length - 1] >= weights[0];
  const strokeColor = isUp ? "#94a3b8" : "#84cc16";

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[1, 2, 3].map((i) => (
          <line
            key={`h-${i}`}
            x1={PAD}
            y1={PAD + (i * (H - PAD * 2)) / 4}
            x2={W - PAD}
            y2={PAD + (i * (H - PAD * 2)) / 4}
            stroke="#e7e5e4"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}
        {[1, 2, 3].map((i) => (
          <line
            key={`v-${i}`}
            x1={PAD + (i * (W - PAD * 2)) / 4}
            y1={PAD}
            x2={PAD + (i * (W - PAD * 2)) / 4}
            y2={H - PAD}
            stroke="#e7e5e4"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}
        <path d={fillD} fill="url(#weightGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {sorted.map((e, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(e.weight_kg)}
            r={i === sorted.length - 1 ? 3 : 1.5}
            fill={i === sorted.length - 1 ? strokeColor : "white"}
            stroke={strokeColor}
            strokeWidth={1}
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs font-medium text-stone-400">
          {formatDate(sorted[0].recorded_at)}
        </span>
        <span className="text-xs font-medium text-stone-400">
          {formatDate(sorted[sorted.length - 1].recorded_at)}
        </span>
      </div>
    </div>
  );
}

export default function WeightTrackingSection({
  weightData,
  isLoading,
  onCreateWeight,
  onDeleteWeight,
  isCreating,
}: WeightTrackingSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const now = new Date();
  const todayYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [date, setDate] = useState(todayYmd);
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showAllEntries, setShowAllEntries] = useState(false);

  const entries = weightData?.entries || [];
  const latest = entries[0]?.weight_kg ?? null;
  const prev = entries[1]?.weight_kg ?? null;
  const diff =
    latest !== null && prev !== null
      ? parseFloat((latest - prev).toFixed(1))
      : null;
  const isUp = diff !== null && diff > 0;
  const isDown = diff !== null && diff < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!weight || isNaN(w) || w <= 0 || isCreating) return;

    // Calculate local timezone offset string (e.g., +07:00)
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const offsetStr = `${sign}${pad(offset / 60)}:${pad(offset % 60)}`;

    // Combine date + time + local offset (RFC3339)
    const recordedAt = `${date}T${time}:00${offsetStr}`;

    onCreateWeight({
      weight_kg: w,
      recorded_at: recordedAt,
      note: note.trim() || undefined,
    });
    setWeight("");
    setNote("");
    const nowSub = new Date();
    setDate(`${nowSub.getFullYear()}-${String(nowSub.getMonth() + 1).padStart(2, "0")}-${String(nowSub.getDate()).padStart(2, "0")}`);
    setTime(nowSub.toTimeString().slice(0, 5));
    setIsAdding(false);
  };

  // STEP 1: Click delete -> Show confirmation
  const handleDeleteClick = (id: number) => {
    setConfirmDeleteId(id);
  };

  // STEP 2: Confirm in modal -> Actually delete
  const handleConfirmDelete = () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    onDeleteWeight(id);
    setConfirmDeleteId(null);
    // Loading state is managed by the parent query, but we'll clear our local deletingId after a timeout
    setTimeout(() => setDeletingId(null), 2000);
  };

  const THAI_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const beYear = parseInt(date.split("-")[0]) + 543;
  const currentMonth = parseInt(date.split("-")[1]);
  const currentDay = parseInt(date.split("-")[2]);

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100 overflow-hidden relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime-50 flex items-center justify-center shrink-0">
            <Scale className="h-4 w-4 text-lime-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 leading-tight">น้ำหนัก</h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-0.5">Weight Tracking</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isCreating}
          className="flex items-center gap-1.5 rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-white hover:bg-lime-600 active:scale-95 transition-all shadow-md shadow-lime-500/20 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          บันทึก
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/50">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">ปัจจุบัน</div>
          {isLoading ? (
            <div className="h-8 w-20 bg-neutral-200 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900 tracking-tighter tabular-nums">
                {latest !== null ? latest : "—"}
              </span>
              {latest !== null && (
                <span className="text-sm font-bold text-neutral-400">kg</span>
              )}
            </div>
          )}

          {diff !== null && (
            <div className={`mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${isDown ? "bg-emerald-50 text-emerald-600" : isUp ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-500"
              }`}>
              {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
              {diff > 0 ? `+${diff}` : diff} kg
            </div>
          )}
        </div>

        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/50 overflow-hidden">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">แนวโน้ม</div>
          {!isLoading && entries.length >= 2 ? (
            <div className="relative h-28 w-full">
              <WeightChart entries={entries} />
            </div>
          ) : (
            <div className="h-20 flex items-center text-[10px] font-bold text-neutral-300">สะสมข้อมูลเพิ่มเพื่อรอรับกราฟ</div>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="pt-3 border-t border-neutral-100">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
            ประวัติการบันทึก
          </p>
          <div className="space-y-1">
            {(showAllEntries ? entries : entries.slice(0, 3)).map((entry, idx) => {
              const prevW = entries[idx + 1]?.weight_kg;
              const entryDiff =
                prevW !== undefined
                  ? parseFloat((entry.weight_kg - prevW).toFixed(1))
                  : null;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-stone-50/80 transition-colors group"
                >
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-medium bg-stone-100 text-stone-500">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-stone-900 tabular-nums">
                        {entry.weight_kg} kg
                      </span>
                      {entryDiff !== null && (
                        <span className={`text-[10px] font-bold ${entryDiff > 0 ? "text-stone-500" : entryDiff < 0 ? "text-stone-400" : "text-stone-300"}`}>
                          {entryDiff > 0 ? `+${entryDiff}` : entryDiff}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatDate(entry.recorded_at)}</span>
                      {entry.note && <span className="truncate"> · {entry.note}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(entry.id)}
                    disabled={deletingId === entry.id}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-6 w-6 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
          {entries.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllEntries(!showAllEntries)}
              className="w-full mt-1 py-1.5 text-[10px] font-bold text-neutral-400 uppercase hover:text-neutral-600 transition-colors"
            >
              {showAllEntries ? 'ซ่อน' : `ดูเพิ่มเติม (${entries.length - 3})`}
            </button>
          )}
        </div>
      )}

      {entries.length === 0 && !isLoading && (
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col items-center py-8">
          <Scale className="h-10 w-10 text-stone-300 mb-3" />
          <p className="text-xs font-medium text-stone-500">
            ยังไม่มีข้อมูลน้ำหนัก
          </p>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6 cursor-pointer bg-stone-900/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setIsAdding(false);
              }
            }}
            aria-label="Close modal"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsAdding(false);
                }
              }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-stone-200" />
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <div>
                  <h4 className="font-semibold text-stone-900">
                    บันทึกน้ำหนัก
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    กรอกข้อมูลล่าสุดของคุณ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase  block mb-2">
                    น้ำหนัก (kg)
                  </label>
                  <div className="flex items-end gap-2 bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <input
                      autoFocus
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="flex-1 bg-transparent text-base font-semibold text-stone-900 text-center tabular-nums focus:outline-none placeholder-stone-300"
                      placeholder="0.0"
                    />
                    <span className="text-base font-medium text-stone-500 mb-0.5">
                      kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12">
                    <label className="text-xs font-medium text-stone-500 uppercase block mb-2">
                      วันที่และเวลา (พ.ศ.)
                    </label>
                  </div>

                  {/* วัน */}
                  <div className="col-span-3">
                    <select
                      value={currentDay}
                      onChange={(e) => {
                        const parts = date.split("-");
                        parts[2] = e.target.value.padStart(2, "0");
                        setDate(parts.join("-"));
                      }}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-2 text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* เดือน */}
                  <div className="col-span-5">
                    <select
                      value={currentMonth}
                      onChange={(e) => {
                        const parts = date.split("-");
                        parts[1] = e.target.value.padStart(2, "0");
                        setDate(parts.join("-"));
                      }}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-2 text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
                    >
                      {THAI_MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* ปี (พ.ศ.) */}
                  <div className="col-span-4">
                    <select
                      value={beYear}
                      onChange={(e) => {
                        const parts = date.split("-");
                        parts[0] = (parseInt(e.target.value) - 543).toString();
                        setDate(parts.join("-"));
                      }}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-2 text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const y = new Date().getFullYear() + 543 - i;
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>

                  {/* เวลา */}
                  <div className="col-span-12 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
                        />
                      </div>
                      <span className="text-xs text-stone-400 font-medium">น.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase  block mb-2">
                    โน้ต (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 h-11 text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400/20 transition-all placeholder-stone-400"
                    placeholder="หลังตื่นนอน, ก่อนอาหาร..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-600 cursor-pointer transition-all duration-200 hover:bg-stone-50 active:scale-[0.98]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !weight}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        บันทึก...
                      </>
                    ) : (
                      "บันทึกข้อมูล"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteId !== null && (
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm cursor-default"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                  <Trash2 className="h-7 w-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  ยืนยันการลบ?
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                  ข้อมูลน้ำหนักนี้จะถูกลบออกจากประวัติอย่างถาวร
                  และไม่สามารถกู้คืนได้
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 text-sm font-bold hover:bg-stone-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors"
                  >
                    ลบเลย
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

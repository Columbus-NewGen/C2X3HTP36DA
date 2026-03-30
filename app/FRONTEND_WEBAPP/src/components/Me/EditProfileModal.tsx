import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import type { User as UserType } from "../../types/auth.types";
import type { UpdateUserProfilePayload } from "../../types/user.types";

interface EditProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserProfilePayload) => void;
  isSaving: boolean;
}
function toInputDate(value?: string | null) {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  // ถ้าค่าเป็นปี พ.ศ. (เช่น > 2400) ให้แปลงเป็น ค.ศ. สำหรับ input value
  if (d.getFullYear() > 2400) {
    d.setFullYear(d.getFullYear() - 543);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}




const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const FITNESS_LEVELS = [
  { value: "beginner", label: "เริ่มต้น", sub: "Beginner" },
  { value: "intermediate", label: "ปานกลาง", sub: "Intermediate" },
  { value: "advanced", label: "เชี่ยวชาญ", sub: "Advanced" },
];

const FITNESS_GOALS = [
  { value: "weight_loss", label: "ลดน้ำหนัก", sub: "Weight Loss" },
  { value: "muscle_gain", label: "เพิ่มกล้ามเนื้อ", sub: "Muscle Gain" },
  { value: "strength", label: "ความแข็งแรง", sub: "Strength" },
  { value: "general_fitness", label: "สุขภาพทั่วไป", sub: "General Fitness" },
];

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold text-neutral-400 uppercase ">
        {text}
      </span>
    </div>
  );
}

function SelectChip({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-4 text-center border cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-95 ${selected
        ? "border-lime-500 bg-gradient-to-b from-white to-lime-50/30 shadow-lg shadow-lime-500/10 ring-1 ring-lime-500/20"
        : "border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200"
        }`}
    >
      {selected && (
        <motion.div
          layoutId="active-bar"
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-lime-500"
        />
      )}
      <span
        className={`text-sm font-bold leading-tight  ${selected ? "text-neutral-900" : "text-neutral-500"}`}
      >
        {label}
      </span>
      {sub && (
        <span
          className={`text-[10px] font-bold uppercase  ${selected ? "text-lime-500" : "text-neutral-300"}`}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateUserProfilePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date_of_birth: toInputDate(user.date_of_birth) || "",
        gender: user.gender || "",
        height_cm: user.height_cm || undefined,
        fitness_level: user.fitness_level || "",
        fitness_goal: user.fitness_goal || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (
      formData.height_cm &&
      (formData.height_cm < 50 || formData.height_cm > 250)
    )
      e.height_cm = "50–250 ซม.";
    if (
      formData.phone &&
      !/^(\+?[0-9]{1,3})?[0-9]{9,10}$/.test(
        formData.phone.replace(/[-\s]/g, ""),
      )
    )
      e.phone = "รูปแบบไม่ถูกต้อง";
    if (formData.date_of_birth && new Date(formData.date_of_birth) > new Date())
      e.date_of_birth = "ต้องไม่อยู่ในอนาคต";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: UpdateUserProfilePayload = {};
    if (formData.date_of_birth) payload.date_of_birth = formData.date_of_birth;
    if (formData.gender) payload.gender = formData.gender;
    if (formData.height_cm) payload.height_cm = formData.height_cm;
    if (formData.fitness_level) payload.fitness_level = formData.fitness_level;
    if (formData.fitness_goal) payload.fitness_goal = formData.fitness_goal;
    if (formData.phone) payload.phone = formData.phone;
    if (formData.bio !== undefined) payload.bio = formData.bio;
    onSave(payload);
  };

  const field = (name: string, value: string) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const inputCls = (err?: string) =>
    `w-full h-11 rounded-xl border px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 bg-gray-50 ${err
      ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
      : "border-gray-200 focus:border-lime-500 focus:ring-lime-500/15"
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 cursor-pointer bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            } else if (
              (e.key === "Enter" || e.key === " ") &&
              e.target === e.currentTarget
            ) {
              e.preventDefault();
              onClose();
            }
          }}
          aria-label="Close modal"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
            style={{ maxHeight: "93vh" }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
          >
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
              <div className="h-1 w-10 rounded-full bg-stone-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-gray-100">
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  แก้ไขโปรไฟล์
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{user.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* ── Personal ── */}
                <div>
                  <SectionLabel
                    text="ข้อมูลส่วนตัว"
                  />
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-medium text-stone-500 ml-1">
                          วันเกิด (พ.ศ.)
                        </label>
                        <div className="grid grid-cols-12 gap-2">
                          {/* วัน */}
                          <div className="col-span-3">
                            <select
                              value={
                                formData.date_of_birth?.split("-")[2]?.replace(/^0/, "") || ""
                              }
                              onChange={(e) => {
                                const parts = (formData.date_of_birth || "1990-01-01").split("-");
                                parts[2] = e.target.value.padStart(2, "0");
                                field("date_of_birth", parts.join("-"));
                              }}
                              className={inputCls(errors.date_of_birth)}
                            >
                              <option value="">วัน</option>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* เดือน */}
                          <div className="col-span-5">
                            <select
                              value={formData.date_of_birth?.split("-")[1] || ""}
                              onChange={(e) => {
                                const parts = (formData.date_of_birth || "1990-01-01").split("-");
                                parts[1] = e.target.value;
                                field("date_of_birth", parts.join("-"));
                              }}
                              className={inputCls(errors.date_of_birth)}
                            >
                              <option value="">เดือน</option>
                              {THAI_MONTHS.map((m, i) => (
                                <option key={m} value={String(i + 1).padStart(2, "0")}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* ปี (พ.ศ.) */}
                          <div className="col-span-4">
                            <select
                              value={
                                formData.date_of_birth
                                  ? (parseInt(formData.date_of_birth.split("-")[0]) + 543).toString()
                                  : ""
                              }
                              onChange={(e) => {
                                const parts = (formData.date_of_birth || "1990-01-01").split("-");
                                parts[0] = (parseInt(e.target.value) - 543).toString();
                                field("date_of_birth", parts.join("-"));
                              }}
                              className={inputCls(errors.date_of_birth)}
                            >
                              <option value="">ปี พ.ศ.</option>
                              {Array.from({ length: 100 }, (_, i) => {
                                const be = new Date().getFullYear() + 543 - i;
                                return (
                                  <option key={be} value={be}>
                                    {be}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                        {errors.date_of_birth && (
                          <p className="text-xs text-stone-600 ml-1 font-medium">
                            {errors.date_of_birth}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-500 ml-1">
                          เพศ
                        </label>
                        <div className="relative">
                          <select
                            value={formData.gender || ""}
                            onChange={(e) => field("gender", e.target.value)}
                            className={`${inputCls()} appearance-none pr-8 cursor-pointer`}
                          >
                            <option value="">เลือก</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                            <option value="other">อื่นๆ</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase  ml-1 mb-1 block">
                          ส่วนสูง (cm)
                        </label>
                        <input
                          type="number"
                          value={formData.height_cm ?? ""}
                          min={50}
                          max={250}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              height_cm: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                          className={inputCls(errors.height_cm)}
                          placeholder="175"
                        />
                        {errors.height_cm && (
                          <p className="text-xs text-stone-600 ml-1 font-medium">
                            {errors.height_cm}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase  ml-1 mb-1 block">
                          เบอร์โทร
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) => field("phone", e.target.value)}
                          className={inputCls(errors.phone)}
                          placeholder="0812345678"
                        />
                        {errors.phone && (
                          <p className="text-xs text-stone-600 ml-1 font-medium">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Fitness Level ── */}
                <div>
                  <SectionLabel
                    text="ระดับความฟิต"
                  />
                  <div className="flex gap-2">
                    {FITNESS_LEVELS.map((l) => (
                      <SelectChip
                        key={l.value}
                        label={l.label}
                        sub={l.sub}
                        selected={formData.fitness_level === l.value}
                        onClick={() =>
                          field(
                            "fitness_level",
                            formData.fitness_level === l.value ? "" : l.value,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* ── Fitness Goal ── */}
                <div>
                  <SectionLabel
                    text="เป้าหมาย"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {FITNESS_GOALS.map((g) => (
                      <SelectChip
                        key={g.value}
                        label={g.label}
                        sub={g.sub}
                        selected={formData.fitness_goal === g.value}
                        onClick={() =>
                          field(
                            "fitness_goal",
                            formData.fitness_goal === g.value ? "" : g.value,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* ── Bio ── */}
                <div>
                  <SectionLabel
                    text="แนะนำตัวเอง"
                  />
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => field("bio", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/15 transition-all placeholder-gray-400 resize-none"
                    placeholder="เขียนอะไรบางอย่างเกี่ยวกับตัวคุณ..."
                  />
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      บันทึกการเปลี่ยนแปลง
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

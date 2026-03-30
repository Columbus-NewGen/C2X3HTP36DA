import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  Plus,
  X as XIcon,
  Info,
  Activity,
  Video,
  Target,
  Wrench,
} from "lucide-react";
import { Field, Input, Textarea, Select } from "../../components/ui";
import { equipmentApi } from "../../services/EquipmentAPI";
import { muscleApi } from "../../services/MuscleAPI";
import type { Equipment } from "../../types/equipment.types";
import type { Muscle } from "../../types/muscles.types";
import { ImageUploader } from "../../components/ImageUploader";
import type { ImageUploadResult } from "../../components/ImageUploader";
import type {
  ExerciseFormData,
  ExerciseDisplay,
  DifficultyLevel,
  MovementPattern,
} from "../../types/exercise.types";
import { cn } from "../../utils/cn";
import { resolveImageUrl } from "../../utils/floorplan.utils";

interface DrawerFormContentProps {
  form: ExerciseFormData;
  formErrors: Partial<Record<keyof ExerciseFormData, string>> & {
    _general?: string;
  };
  drawerMode: "CREATE" | "EDIT";
  selectedExercise: ExerciseDisplay | null;
  submitting: boolean;
  onFormChange: (next: Partial<ExerciseFormData>) => void;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
// [FIX spacing] Base padding = 24px (p-6) everywhere — no more p-5/p-6 mix
// [FIX shadow] border only, no shadow-sm — cleaner, less MVP-feeling
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header — fixed 48px height, consistent */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon size={14} className="text-gray-400" />
          </div>
          <div>
            {/* [FIX uppercase] Title uses sentence case, not uppercase */}
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {title}
            </p>
            {/* [FIX uppercase] EN subtitle — uppercase OK here, it's a micro label */}
            <p className="text-[10px] font-semibold uppercase  text-gray-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {/* Body — [FIX spacing] p-6 = 24px base */}
      <div className="p-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─── Add Button ───────────────────────────────────────────────────────────────
// [FIX lime] AddButton is NOT a primary CTA — use neutral, not lime
function AddButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold hover:bg-gray-200 transition-colors disabled:opacity-40"
    >
      <Plus size={12} />
      {children}
    </button>
  );
}

// ─── Remove Button ────────────────────────────────────────────────────────────
function RemoveButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-100 text-gray-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex-shrink-0"
    >
      <XIcon size={14} />
    </button>
  );
}

// ─── Empty Row ────────────────────────────────────────────────────────────────
function EmptyRow({ label }: { label: string }) {
  return (
    <div className="py-6 text-center">
      {/* [FIX uppercase] This IS a micro-label context — uppercase OK */}
      <p className="text-[11px] font-semibold uppercase  text-gray-300">
        {label}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export function DrawerFormContent({
  form,
  formErrors,
  drawerMode,
  selectedExercise,
  submitting,
  onFormChange,
}: DrawerFormContentProps) {
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [muscleOptions, setMuscleOptions] = useState<Muscle[]>([]);
  const [muscleLoading, setMuscleLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setEquipmentLoading(true);
    equipmentApi
      .getAll()
      .then((res) => {
        if (mounted) {
          const sorted = (res.equipment || []).sort((a, b) =>
            a.equipment_name.localeCompare(b.equipment_name)
          );
          setEquipmentOptions(sorted);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setEquipmentLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setMuscleLoading(true);
    muscleApi
      .getAllMuscles()
      .then((res) => {
        if (mounted) {
          const sorted = (res.muscles || []).sort((a, b) =>
            a.muscle_name.localeCompare(b.muscle_name)
          );
          setMuscleOptions(sorted);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setMuscleLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const groupedMuscles = useMemo(() => {
    const groups: Record<string, Muscle[]> = {};
    muscleOptions.forEach((m) => {
      const gName = m.groups?.[0]?.group_name || "อื่น ๆ (Other)";
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(m);
    });
    // Sort keys alphabetically
    const sortedGroups: Record<string, Muscle[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });
    return sortedGroups;
  }, [muscleOptions]);

  const totalActivation = useMemo(() => {
    return (form.muscles || []).reduce(
      (sum, m) => sum + (m.activation_percentage || 0),
      0
    );
  }, [form.muscles]);

  return (
    <div className=" py-6 flex flex-col gap-4 pb-10">
      {/* [FIX spacing] Outer container px-6 py-6 = 24px base, gap-4 = 16px between cards */}

      {/* ── General error ── */}
      {formErrors._general && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
          <div className="w-7 h-7 rounded-lg bg-white border border-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={14} className="text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-800 leading-none mb-1">
              พบข้อผิดพลาด
            </p>
            <p className="text-xs text-rose-600 leading-relaxed">
              {formErrors._general}
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1: ข้อมูลทั่วไป ── */}
      <SectionCard
        icon={Info}
        title="ข้อมูลทั่วไป"
        subtitle="General Information"
      >
        {/* [FIX uppercase] Field labels — sentence case, NO uppercase */}
        <Field
          label="ชื่อท่าฝึก"
          hint="จำเป็น"
          required
          error={formErrors.exercise_name}
        >
          <Input
            value={form.exercise_name}
            onChange={(e) => onFormChange({ exercise_name: e.target.value })}
            placeholder="เช่น Bench Press, Deadlift"
            disabled={submitting}
            className={cn(
              " text-gray-900",
              formErrors.exercise_name && "border-rose-300 bg-rose-50/50",
            )}
          />
        </Field>

        <Field
          label="คำอธิบาย"
          hint="จำเป็น"
          required
          error={formErrors.description}
        >
          <Textarea
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            rows={3}
            placeholder="อธิบายท่าฝึก จุดสำคัญ และท่าทางที่ถูกต้อง..."
            disabled={submitting}
            className={cn(
              formErrors.description && "border-rose-300 bg-rose-50/50",
            )}
          />
        </Field>
      </SectionCard>

      {/* ── Section 2: Movement & Pattern ── */}
      <SectionCard
        icon={Target}
        title="รายละเอียดการเล่น"
        subtitle="Movement & Pattern"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="รูปแบบการเคลื่อนไหว"
            required
            error={formErrors.movement_pattern}
          >
            <Select
              value={form.movement_pattern}
              onChange={(e) =>
                onFormChange({
                  movement_pattern: e.target.value as MovementPattern,
                })
              }
              disabled={submitting}
              className={cn(
                formErrors.movement_pattern && "border-rose-300 bg-rose-50/50",
              )}
            >
              <option value="push">Push</option>
              <option value="pull">Pull</option>
              <option value="squat">Squat</option>
              <option value="hinge">Hinge</option>
              <option value="carry">Carry</option>
              <option value="rotation">Rotation</option>
            </Select>
          </Field>

          <Field label="ระดับความยาก" required>
            <Select
              value={form.difficulty_level}
              onChange={(e) =>
                onFormChange({
                  difficulty_level: e.target.value as DifficultyLevel,
                })
              }
              disabled={submitting}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="ประเภทท่าฝึก" required error={formErrors.movement_type}>
            <Input
              value={form.movement_type}
              onChange={(e) => onFormChange({ movement_type: e.target.value })}
              placeholder="เช่น Compound"
              disabled={submitting}
              className={cn(
                formErrors.movement_type && "border-rose-300 bg-rose-50/50",
              )}
            />
          </Field>

          <Field label="ความซับซ้อน">
            {/* Pill toggle — neutral active state, not violet/lime */}
            <div className="flex h-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden p-1 gap-1">
              <button
                type="button"
                onClick={() => onFormChange({ is_compound: true })}
                disabled={submitting}
                className={cn(
                  "flex-1 rounded-lg text-xs font-semibold transition-all",
                  form.is_compound
                    ? "bg-white text-gray-900 border border-gray-200"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                Compound
              </button>
              <button
                type="button"
                onClick={() => onFormChange({ is_compound: false })}
                disabled={submitting}
                className={cn(
                  "flex-1 rounded-lg text-xs font-semibold transition-all",
                  !form.is_compound
                    ? "bg-white text-gray-900 border border-gray-200"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                Isolation
              </button>
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Section 3: Media ── */}
      <SectionCard icon={Video} title="มีเดีย" subtitle="Images & Videos">
        <Field label="รูปภาพประกอบ" hint="JPG/PNG ไม่เกิน 5MB">
          <ImageUploader
            entityType="exercise"
            initialImageUrl={
              drawerMode === "EDIT" && selectedExercise
                ? selectedExercise.image
                : form.image_key
                  ? `${import.meta.env.VITE_SERVER_URL || ""}/api/v1/media/${form.image_key}`
                  : null
            }
            onUploadComplete={(result: ImageUploadResult) => {
              onFormChange({ image_key: result.key });
            }}
            onRemove={() => onFormChange({ image_key: null })}
            disabled={submitting}
            placeholder="อัปโหลดรูปภาพท่าฝึก"
          />
        </Field>

        <Field label="ลิงก์วิดีโอ YouTube" hint="ระบุถ้ามี">
          <div className="relative">
            <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            <Input
              type="url"
              value={form.video_url}
              onChange={(e) => onFormChange({ video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              disabled={submitting}
              className="pl-10"
            />
          </div>
        </Field>
      </SectionCard>

      {/* ── Section 4: Muscles ── */}
      <SectionCard
        icon={Activity}
        title="กล้ามเนื้อที่ใช้"
        subtitle="Target Muscles & Activation"
        action={
          <AddButton
            onClick={() =>
              onFormChange({
                muscles: [
                  ...(form.muscles || []),
                  {
                    muscle_id: muscleOptions[0]?.id ?? 0,
                    involvement_type: "primary",
                    activation_percentage: 100,
                  },
                ],
              })
            }
            disabled={submitting || muscleLoading}
          >
            เพิ่ม
          </AddButton>
        }
      >
        {form.muscles && form.muscles.length > 0 && (
          <div
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between mb-2",
              totalActivation === 100
                ? "bg-lime-50 text-lime-700 border border-lime-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Activity size={12} />
              <span>TOTAL ACTIVATION</span>
            </div>
            <span className={cn(totalActivation !== 100 && "animate-pulse")}>
              {totalActivation}% / 100%
            </span>
          </div>
        )}

        {!form.muscles || form.muscles.length === 0 ? (
          <EmptyRow label="ยังไม่มีข้อมูลกล้ามเนื้อ" />
        ) : (
          <div className="flex flex-col gap-2">
            {form.muscles.map((m, idx) => (
              <div
                key={idx}
                className="group/item relative flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-lime-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Muscle Target #{idx + 1}
                  </span>
                  <RemoveButton
                    onClick={() => {
                      const next = (form.muscles || []).slice();
                      next.splice(idx, 1);
                      onFormChange({ muscles: next });
                    }}
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-12 gap-2 mt-1">
                  <div className="col-span-12 sm:col-span-5">
                    <Select
                      value={String(m.muscle_id)}
                      onChange={(e) => {
                        const next = (form.muscles || []).slice();
                        next[idx] = {
                          ...next[idx],
                          muscle_id: Number(e.target.value),
                        };
                        onFormChange({ muscles: next });
                      }}
                      disabled={submitting || muscleLoading}
                      className="text-xs h-10 bg-white text-zinc-900 shadow-sm"
                    >
                      <option value="" disabled>
                        เลือกกล้ามเนื้อ...
                      </option>
                      {Object.entries(groupedMuscles).map(([gName, muscles]) => (
                        <optgroup key={gName} label={gName}>
                          {muscles.map((muscle) => (
                            <option key={muscle.id} value={muscle.id}>
                              {muscle.muscle_name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-7 sm:col-span-4">
                    <Select
                      value={m.involvement_type}
                      onChange={(e) => {
                        const next = (form.muscles || []).slice();
                        next[idx] = {
                          ...next[idx],
                          involvement_type: e.target.value as any,
                        };
                        onFormChange({ muscles: next });
                      }}
                      disabled={submitting}
                      className="text-xs h-10 bg-white text-zinc-900 shadow-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="stabilizer">Stabilizer</option>
                    </Select>
                  </div>
                  <div className="col-span-5 sm:col-span-3 relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={m.activation_percentage}
                      onChange={(e) => {
                        const next = (form.muscles || []).slice();
                        next[idx] = {
                          ...next[idx],
                          activation_percentage: Number(e.target.value),
                        };
                        onFormChange({ muscles: next });
                      }}
                      disabled={submitting}
                      className="pr-7 text-xs h-10 bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Section 5: Equipment ── */}
      <SectionCard
        icon={Wrench}
        title="อุปกรณ์"
        subtitle="Equipment Required"
        action={
          <AddButton
            onClick={() =>
              onFormChange({
                equipment: [
                  ...(form.equipment || []),
                  {
                    equipment_id: equipmentOptions[0]?.id ?? 0,
                    is_required: true,
                  },
                ],
              })
            }
            disabled={submitting || equipmentLoading}
          >
            เพิ่ม
          </AddButton>
        }
      >
        {!form.equipment || form.equipment.length === 0 ? (
          <EmptyRow label="ยังไม่มีข้อมูลอุปกรณ์" />
        ) : (
          <div className="flex flex-col gap-2">
            {form.equipment.map((eq, idx) => (
              <div
                key={idx}
                className="group/item relative flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-lime-200 shadow-sm"
              >
                <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                  {(() => {
                    const opt = equipmentOptions.find(
                      (o) => o.id === eq.equipment_id
                    );
                    const img = resolveImageUrl(opt?.image_url);
                    return img ? (
                      <img
                        src={img}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        alt=""
                      />
                    ) : (
                      <Wrench size={24} className="text-gray-200" />
                    );
                  })()}
                </div>

                <div className="flex-1 space-y-2">
                  <Select
                    value={String(eq.equipment_id)}
                    onChange={(e) => {
                      const next = (form.equipment || []).slice();
                      next[idx] = {
                        ...next[idx],
                        equipment_id: Number(e.target.value),
                      };
                      onFormChange({ equipment: next });
                    }}
                    disabled={submitting || equipmentLoading}
                    className="text-xs h-10 bg-white text-zinc-900 shadow-sm"
                  >
                    <option value="" disabled>
                      เลือกอุปกรณ์...
                    </option>
                    {equipmentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.equipment_name}
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center gap-2">
                    <Select
                      value={eq.is_required ? "required" : "optional"}
                      onChange={(e) => {
                        const next = (form.equipment || []).slice();
                        next[idx] = {
                          ...next[idx],
                          is_required: e.target.value === "required",
                        };
                        onFormChange({ equipment: next });
                      }}
                      disabled={submitting}
                      className="text-xs h-8 px-2 bg-white text-zinc-900 border-zinc-200"
                    >
                      <option value="required">จำเป็น (Required)</option>
                      <option value="optional">ทางเลือก (Optional)</option>
                    </Select>

                    <RemoveButton
                      onClick={() => {
                        const next = (form.equipment || []).slice();
                        next.splice(idx, 1);
                        onFormChange({ equipment: next });
                      }}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

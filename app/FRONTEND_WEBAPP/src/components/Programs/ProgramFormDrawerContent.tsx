import {
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Plus,
  Trash2,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Field, Input, Select, Textarea } from "../ui";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import type { Exercise } from "../../types/exercise.types";
import type {
  ProgramSessionPayload,
  ProgramExercisePayload,
  DrawerMode,
  ProgramFormData,
  ProgramFormErrors,
} from "../../utils/programs.utils";

interface ProgramFormDrawerContentProps {
  drawerMode: DrawerMode;
  form: ProgramFormData;
  formErrors: ProgramFormErrors;
  sessionsForm: ProgramSessionPayload[];
  exercisesList: Exercise[];
  loadingExercises: boolean;
  submitting: boolean;
  expandedSessionIdx: number | null;
  onFormChange: (patch: Partial<ProgramFormData>) => void;
  onAddSession: () => void;
  onRemoveSession: (idx: number) => void;
  onUpdateSession: (idx: number, patch: Partial<ProgramSessionPayload>) => void;
  onAddExercise: (sessionIdx: number) => void;
  onRemoveExercise: (sessionIdx: number, exIdx: number) => void;
  onUpdateExercise: (
    sessionIdx: number,
    exIdx: number,
    patch: Partial<ProgramExercisePayload>,
  ) => void;
  onExpandedChange: (idx: number | null) => void;
}

export function ProgramFormDrawerContent({
  drawerMode,
  form,
  formErrors,
  sessionsForm,
  exercisesList,
  loadingExercises,
  submitting,
  expandedSessionIdx,
  onFormChange,
  onAddSession,
  onRemoveSession,
  onUpdateSession,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onExpandedChange,
}: ProgramFormDrawerContentProps) {
  const [activePicker, setActivePicker] = useState<{
    sIdx: number;
    exIdx: number;
  } | null>(null);

  return (
    <div className="space-y-6">
      <ExercisePickerModal
        isOpen={!!activePicker}
        onClose={() => setActivePicker(null)}
        exercises={exercisesList}
        selectedId={
          activePicker
            ? sessionsForm[activePicker.sIdx].exercises[activePicker.exIdx]
              .exercise_id
            : undefined
        }
        onSelect={(ex) => {
          if (activePicker) {
            onUpdateExercise(activePicker.sIdx, activePicker.exIdx, {
              exercise_id: ex.id,
            });
          }
        }}
      />

      {formErrors._general && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-800">{formErrors._general}</div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2.5">
        <Info className="h-4 w-4 text-gray-400 shrink-0" />
        <p className="text-xs font-medium text-gray-500 leading-tight">
          สร้างโปรแกรมการฝึกโดยระบุเป้าหมาย และกำหนดวันฝึกพร้อมท่าที่ต้องการ
        </p>
      </div>

      <div className="space-y-4">
        <Field
          label="ชื่อโปรแกรม"
          hint="จำเป็น"
          required
          error={formErrors.program_name}
        >
          <Input
            value={form.program_name}
            onChange={(e) => onFormChange({ program_name: e.target.value })}
            placeholder="เช่น โปรแกรมเริ่มต้นแบบเต็มตัว"
            disabled={submitting}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="เป้าหมาย" required error={formErrors.goal}>
            <Select
              value={form.goal}
              onChange={(e) => onFormChange({ goal: e.target.value as any })}
              disabled={submitting}
            >
              <option value="general fitness">ฟิตเนสทั่วไป</option>
              <option value="muscle gain">เพิ่มกล้ามเนื้อ</option>
              <option value="strength">เพิ่มความแข็งแรง</option>
              <option value="weight loss">ลดน้ำหนัก</option>
            </Select>
          </Field>

          <Field
            label="ระดับความยาก"
            required
            error={formErrors.difficulty_level}
          >
            <Select
              value={form.difficulty_level}
              onChange={(e) =>
                onFormChange({
                  difficulty_level: e.target.value as any,
                })
              }
              disabled={submitting}
            >
              <option value="beginner">เริ่มต้น</option>
              <option value="intermediate">ปานกลาง</option>
              <option value="advanced">ขั้นสูง</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="ระยะเวลา (สัปดาห์)"
            required
            error={formErrors.duration_weeks}
          >
            <Input
              type="number"
              min={1}
              max={52}
              value={form.duration_weeks}
              onChange={(e) =>
                onFormChange({
                  duration_weeks: Number(e.target.value),
                })
              }
              disabled={submitting}
            />
          </Field>

          <Field
            label="วันต่อสัปดาห์"
            required
            error={formErrors.days_per_week}
          >
            <Input
              type="number"
              min={1}
              max={7}
              value={form.days_per_week}
              onChange={(e) =>
                onFormChange({
                  days_per_week: Number(e.target.value),
                })
              }
              disabled={submitting}
            />
          </Field>
        </div>

        <Field label="เป็นเทมเพลต">
          <Select
            value={form.is_template ? "true" : "false"}
            onChange={(e) =>
              onFormChange({
                is_template: e.target.value === "true",
              })
            }
            disabled={submitting}
          >
            <option value="true">เทมเพลต</option>
            <option value="false">โปรแกรมผู้ใช้</option>
          </Select>
        </Field>

        <Field label="คำอธิบาย" hint="ไม่บังคับ" error={formErrors.description}>
          <Textarea
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            rows={4}
            placeholder="อธิบายโปรแกรม จุดมุ่งหมาย และคุณสมบัติหลัก..."
            disabled={submitting}
          />
        </Field>

        {(drawerMode === "CREATE" || drawerMode === "EDIT") && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  วันฝึก (Workout Days)
                </h4>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold">
                  Manage your weekly schedule
                </p>
              </div>
              <button
                onClick={onAddSession}
                disabled={submitting || loadingExercises}
                className="h-8 px-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                เพิ่มวันฝึก
              </button>
            </div>

            {loadingExercises && exercisesList.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Loading Exercises...
                </p>
              </div>
            ) : sessionsForm.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 p-8 text-center">
                <Plus className="h-8 w-8 text-gray-100 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-300">
                  ยังไม่มีวันฝึก
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  คลิกปุ่มด้านบนเพื่อเพิ่มแผนการฝึก
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionsForm.map((s, sIdx) => {
                  const isExpanded = expandedSessionIdx === sIdx;
                  return (
                    <div
                      key={sIdx}
                      className={`rounded-2xl border transition-all ${isExpanded
                        ? "border-lime-200 bg-white ring-4 ring-lime-500/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-2 p-3 sm:p-4">
                        <button
                          type="button"
                          onClick={() =>
                            onExpandedChange(isExpanded ? null : sIdx)
                          }
                          className="flex-1 flex items-center gap-3 text-left min-w-0"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isExpanded
                              ? "bg-lime-500 text-white"
                              : "bg-gray-50 text-gray-400"
                              }`}
                          >
                            {String(sIdx + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate leading-none mb-1">
                              {s.session_name || "ไม่มีชื่อวันฝึก"}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-lime-600 uppercase">
                                {s.workout_split}
                              </span>
                              <span className="text-xs font-bold text-gray-300">
                                ·
                              </span>
                              <span className="text-xs font-bold text-gray-400 uppercase">
                                {s.exercises.length} Exercises
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-300" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-200" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSession(sIdx);
                          }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-3 sm:px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1">
                          <div className="grid grid-cols-3 gap-3">
                            <Field label="Day Index">
                              <Input
                                type="number"
                                min={1}
                                value={s.day_number}
                                onChange={(e) =>
                                  onUpdateSession(sIdx, {
                                    day_number: Number(e.target.value),
                                  })
                                }
                                className="h-9 text-xs"
                              />
                            </Field>
                            <Field label="Weekday (1-7)">
                              <Input
                                type="number"
                                min={1}
                                max={7}
                                placeholder="1=Mon"
                                value={s.day_of_week ?? ""}
                                onChange={(e) =>
                                  onUpdateSession(sIdx, {
                                    day_of_week: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  })
                                }
                                className="h-9 text-xs"
                              />
                            </Field>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-700 mb-1.5 uppercase block">
                                Split Type
                              </span>
                              <Select
                                value={s.workout_split}
                                onChange={(e) =>
                                  onUpdateSession(sIdx, {
                                    workout_split: e.target.value,
                                  })
                                }
                                className="h-9 text-xs"
                              >
                                <option value="Full Body">Full Body</option>
                                <option value="Upper">Upper</option>
                                <option value="Lower">Lower</option>
                                <option value="Push">Push</option>
                                <option value="Pull">Pull</option>
                                <option value="Legs">Legs</option>
                                <option value="Chest">Chest</option>
                                <option value="Back">Back</option>
                                <option value="Shoulders">Shoulders</option>
                                <option value="Arms">Arms</option>
                                <option value="Glutes">Glutes</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Core">Core</option>
                                <option value="Mobility">Mobility</option>
                              </Select>
                            </div>
                          </div>

                          <Field label="Workout Name">
                            <Input
                              value={s.session_name}
                              onChange={(e) =>
                                onUpdateSession(sIdx, {
                                  session_name: e.target.value,
                                })
                              }
                              placeholder="เช่น Heavy Leg Day"
                              className="h-9 text-sm font-bold"
                            />
                          </Field>

                          <Field label="หมายเหตุวันฝึก">
                            <Input
                              value={s.notes ?? ""}
                              onChange={(e) =>
                                onUpdateSession(sIdx, {
                                  notes: e.target.value || undefined,
                                })
                              }
                              placeholder="เพิ่มคำแนะนำสั้นๆ สำหรับวันนี้..."
                              className="h-9 text-xs"
                            />
                          </Field>

                          <div className="space-y-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-400 uppercase">
                                Exercise List
                              </span>
                              <button
                                onClick={() => onAddExercise(sIdx)}
                                disabled={
                                  submitting || exercisesList.length === 0
                                }
                                className="text-xs font-bold text-lime-600 hover:text-lime-700 transition-colors flex items-center gap-1 uppercase"
                              >
                                <Plus className="h-3 w-3" />
                                เพิ่มท่าฝึกในวันนี้
                              </button>
                            </div>

                            <div className="space-y-2">
                              {s.exercises.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="group/ex relative flex items-center gap-2 p-2 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-lime-200 transition-all"
                                >
                                  <div className="flex-1 min-w-0">
                                    {(() => {
                                      const selectedEx = exercisesList.find(
                                        (e) => e.id === ex.exercise_id
                                      );
                                      const thumbUrl = resolveImageUrl(
                                        selectedEx?.image_url
                                      );

                                      return (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActivePicker({
                                              sIdx: sIdx,
                                              exIdx: exIdx,
                                            })
                                          }
                                          className="w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-white hover:ring-2 hover:ring-lime-500/20 transition-all text-left"
                                        >
                                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {thumbUrl ? (
                                              <img
                                                src={thumbUrl}
                                                alt={selectedEx?.exercise_name}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <Activity className="h-4 w-4 text-gray-300" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate leading-none mb-1">
                                              {selectedEx?.exercise_name ||
                                                "Pick Exercise"}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400 uppercase leading-none">
                                              {selectedEx?.movement_pattern ||
                                                "TAP TO SELECT"}
                                            </p>
                                          </div>
                                        </button>
                                      );
                                    })()}
                                  </div>

                                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 shadow-sm shrink-0">
                                    <div className="flex flex-col items-center px-1.5">
                                      <span className="text-xs font-bold text-gray-300 uppercase leading-none mb-1">
                                        Sets
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={ex.sets}
                                        onChange={(e) =>
                                          onUpdateExercise(sIdx, exIdx, {
                                            sets: Number(e.target.value),
                                          })
                                        }
                                        className="w-8 text-xs font-bold text-center border-none p-0 outline-none focus:ring-0"
                                      />
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-50" />
                                    <div className="flex flex-col items-center px-1.5">
                                      <span className="text-xs font-bold text-gray-300 uppercase leading-none mb-1">
                                        Reps
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={ex.reps}
                                        onChange={(e) =>
                                          onUpdateExercise(sIdx, exIdx, {
                                            reps: Number(e.target.value),
                                          })
                                        }
                                        className="w-8 text-xs font-bold text-center border-none p-0 outline-none focus:ring-0"
                                      />
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-50" />
                                    <div className="flex flex-col items-center px-1.5">
                                      <span className="text-xs font-bold text-gray-300 uppercase leading-none mb-1">
                                        Kg
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        step={2.5}
                                        placeholder="0"
                                        value={ex.weight ?? ""}
                                        onChange={(e) =>
                                          onUpdateExercise(sIdx, exIdx, {
                                            weight: e.target.value
                                              ? Number(e.target.value)
                                              : undefined,
                                          })
                                        }
                                        className="w-10 text-xs font-bold text-center border-none p-0 outline-none text-lime-600 focus:ring-0"
                                      />
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-50" />
                                    <div className="flex flex-col items-center px-1.5">
                                      <span className="text-xs font-bold text-gray-300 uppercase leading-none mb-1">
                                        Sec
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        value={ex.rest_seconds ?? ""}
                                        onChange={(e) =>
                                          onUpdateExercise(sIdx, exIdx, {
                                            rest_seconds: e.target.value
                                              ? Number(e.target.value)
                                              : undefined,
                                          })
                                        }
                                        className="w-10 text-xs font-bold text-center border-none p-0 outline-none focus:ring-0"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRemoveExercise(sIdx, exIdx)
                                    }
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

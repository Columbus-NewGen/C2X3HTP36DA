import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Model, {
  type IExerciseData,
  type Muscle as BodyMuscle,
} from "react-body-highlighter";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Info,
  ListTree,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { muscleApi } from "../../services/MuscleAPI";
import type { ExerciseByMuscle, Muscle } from "../../types/muscles.types";
import {
  BACK_SLUGS,
  INV_BADGE,
  INV_COLOR,
  toBodySlug,
} from "../../utils/muscleBodyMap";
import { getImageUrl } from "../../utils/exercise.utils";
import {
  Button,
  Input,
  PageLoader,
  ToastContainer,
  useToasts,
} from "../../components/ui";

export default function MusclesPage() {
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | "ALL">(
    "ALL",
  );
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);

  const [exerciseMap, setExerciseMap] = useState<
    Record<number, ExerciseByMuscle[]>
  >({});
  const [exerciseLoadingId, setExerciseLoadingId] = useState<number | null>(
    null,
  );
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  const { toasts, addToast, removeToast } = useToasts();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    muscleApi
      .getAllMuscles()
      .then((res) => {
        if (cancelled) return;
        setMuscles(res.muscles || []);
        if (res.muscles && res.muscles.length > 0) {
          setSelectedMuscle(res.muscles[0]);
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "ไม่สามารถโหลดข้อมูลกล้ามเนื้อได้",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const musclesByGroup = useMemo(() => {
    const groups = new Map<string, Muscle[]>();
    for (const m of muscles) {
      if (m.groups && m.groups.length > 0) {
        for (const g of m.groups) {
          const key = `${g.id}|${g.group_name}|${g.split_category}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(m);
        }
      } else {
        const key = `other|อื่นๆ|OTHER`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(m);
      }
    }
    return Array.from(groups.entries()).map(([key, list]) => {
      const [, name, split] = key.split("|");
      return {
        key,
        name,
        split,
        muscles: list,
      };
    });
  }, [muscles]);

  const filteredMuscles = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = muscles;
    if (selectedGroupKey !== "ALL") {
      const groupEntry = musclesByGroup.find((g) => g.key === selectedGroupKey);
      if (groupEntry) {
        base = groupEntry.muscles;
      }
    }
    if (!q) return base;
    return base.filter((m) => {
      return (
        m.muscle_name.toLowerCase().includes(q) ||
        m.scientific_name.toLowerCase().includes(q) ||
        m.body_region.toLowerCase().includes(q)
      );
    });
  }, [muscles, musclesByGroup, search, selectedGroupKey]);

  const selectMuscle = useCallback(
    (m: Muscle) => {
      setSelectedMuscle(m);
      setExerciseError(null);
      if (!exerciseMap[m.id]) {
        setExerciseLoadingId(m.id);
        muscleApi
          .getExercisesByMuscle(m.id)
          .then((res) => {
            setExerciseMap((prev) => ({
              ...prev,
              [m.id]: res.exercises || [],
            }));
          })
          .catch((err: any) => {
            setExerciseError(
              err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "ไม่สามารถโหลดท่าฝึกสำหรับกล้ามเนื้อนี้ได้",
            );
          })
          .finally(() => {
            setExerciseLoadingId(null);
          });
      }
    },
    [exerciseMap],
  );

  useEffect(() => {
    if (selectedMuscle && !exerciseMap[selectedMuscle.id]) {
      selectMuscle(selectedMuscle);
    }
  }, [selectedMuscle, exerciseMap, selectMuscle]);

  const currentExercises: ExerciseByMuscle[] =
    selectedMuscle && exerciseMap[selectedMuscle.id]
      ? exerciseMap[selectedMuscle.id]
      : [];

  const modelData: IExerciseData[] = useMemo(() => {
    if (!selectedMuscle) return [];
    const slug = toBodySlug(selectedMuscle.muscle_name);
    if (!slug) return [];
    return [
      {
        name: selectedMuscle.muscle_name,
        muscles: [slug as BodyMuscle],
        frequency: 1,
      },
    ];
  }, [selectedMuscle]);

  const hasFront = useMemo(() => {
    if (!selectedMuscle) return false;
    const s = toBodySlug(selectedMuscle.muscle_name);
    return !!(s && !BACK_SLUGS.has(s));
  }, [selectedMuscle]);

  const hasBack = useMemo(() => {
    if (!selectedMuscle) return false;
    const s = toBodySlug(selectedMuscle.muscle_name);
    return !!(s && BACK_SLUGS.has(s));
  }, [selectedMuscle]);

  const handleOpenExercise = (exerciseId: number) => {
    navigate(`/exercises?id=${exerciseId}`);
    addToast("info", "กำลังเปิดรายละเอียดท่าฝึก...");
  };

  if (loading) {
    return <PageLoader message="กำลังโหลดข้อมูลกล้ามเนื้อ..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ไม่สามารถโหลดข้อมูลกล้ามเนื้อได้
          </h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>ลองอีกครั้ง</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-xs font-bold text-gray-400 uppercase mb-1">
                GYMMATE
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                แผนที่กล้ามเนื้อ (Muscle Atlas)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-400 font-medium">
                เลือกกล้ามเนื้อเพื่อดูว่าฝึกด้วยท่าไหนได้บ้าง
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-6 lg:gap-8 items-start">
          {/* Left: Body model + selected info */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-lime-500" />
                <p className="text-sm font-semibold text-gray-800">
                  แผนที่กล้ามเนื้อร่างกาย
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 bg-gray-100/60 rounded-2xl py-6">
                {hasFront && (
                  <Model
                    data={modelData}
                    style={{ width: "7rem" }}
                    highlightedColors={[
                      INV_COLOR.primary,
                      INV_COLOR.secondary,
                      INV_COLOR.stabilizer,
                    ]}
                    bodyColor="#d1d5db"
                    type="anterior"
                  />
                )}
                {hasBack && (
                  <Model
                    data={modelData}
                    style={{ width: "7rem" }}
                    highlightedColors={[
                      INV_COLOR.primary,
                      INV_COLOR.secondary,
                      INV_COLOR.stabilizer,
                    ]}
                    bodyColor="#d1d5db"
                    type="posterior"
                  />
                )}
                {!hasFront && !hasBack && (
                  <div className="text-center text-xs text-gray-400">
                    ไม่สามารถแสดงตำแหน่งกล้ามเนื้อนี้บนโมเดลได้
                  </div>
                )}
              </div>

              {selectedMuscle && (
                <div className="mt-5 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                      กล้ามเนื้อที่เลือก
                    </p>
                    <p className="text-lg font-bold text-gray-900 leading-tight">
                      {selectedMuscle.muscle_name}
                    </p>
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      {selectedMuscle.scientific_name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">
                          หน้าที่หลัก
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {selectedMuscle.function}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-semibold text-gray-700 uppercase">
                  ใช้งานอย่างไร
                </p>
              </div>
              <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
                <li>ค้นหากล้ามเนื้อจากรายชื่อด้านขวา</li>
                <li>เลือกกล้ามเนื้อเพื่อดูโมเดลร่างกายที่ไฮไลท์จุดนั้น</li>
                <li>กดที่ท่าฝึกเพื่อเปิดรายละเอียดในหน้า Exercises</li>
              </ul>
            </div>
          </div>

          {/* Right: Muscle list + exercises */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
                      กล้ามเนื้อทั้งหมด
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {muscles.length} มัด
                    </p>
                  </div>
                  <div className="relative flex-1 max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ค้นหาตามชื่อ หรือส่วนของร่างกาย..."
                      className="pl-9 h-9 text-xs bg-gray-50 border-gray-100 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ListTree className="h-3.5 w-3.5 text-gray-400" />
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedGroupKey("ALL")}
                      className={[
                        "px-2.5 py-1 rounded-full text-[11px] border",
                        selectedGroupKey === "ALL"
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      ทุกกลุ่ม
                    </button>
                    {musclesByGroup.map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setSelectedGroupKey(g.key)}
                        className={[
                          "px-2.5 py-1 rounded-full text-[11px] border",
                          selectedGroupKey === g.key
                            ? "bg-lime-500 text-white border-lime-500"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
                        ].join(" ")}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                {musclesByGroup
                  .filter(
                    (g) =>
                      selectedGroupKey === "ALL" || g.key === selectedGroupKey,
                  )
                  .map((group) => {
                    const groupMuscles = filteredMuscles.filter((m) =>
                      group.muscles.some((gm) => gm.id === m.id),
                    );
                    if (groupMuscles.length === 0) return null;
                    return (
                      <div key={group.key} className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            {group.name}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {groupMuscles.length} มัด
                          </span>
                        </div>
                        {groupMuscles.map((m) => {
                          const isActive = selectedMuscle?.id === m.id;
                          const region = m.body_region.replace(/_/g, " ");
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => selectMuscle(m)}
                              className={[
                                "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all",
                                isActive
                                  ? "bg-lime-50 border border-lime-200"
                                  : "bg-gray-50/40 border border-transparent hover:border-gray-200",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-lime-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">
                                    {m.muscle_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 uppercase truncate">
                                    {region}
                                  </p>
                                </div>
                              </div>
                              {isActive && (
                                <span
                                  className={[
                                    "text-[10px] font-semibold rounded-full px-2 py-0.5 flex items-center gap-1",
                                    INV_BADGE.primary.bg,
                                    INV_BADGE.primary.text,
                                  ].join(" ")}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: INV_COLOR.primary }}
                                  />
                                  เลือกอยู่
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                {filteredMuscles.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    ไม่พบกล้ามเนื้อที่ตรงกับคำค้นหา
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-500" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
                      ท่าฝึกที่ใช้กล้ามเนื้อนี้
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedMuscle
                        ? selectedMuscle.muscle_name
                        : "ยังไม่ได้เลือกกล้ามเนื้อ"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  {currentExercises.length} ท่า
                </p>
              </div>

              <div className="px-4 pb-4 pt-1 space-y-2 max-h-[320px] overflow-y-auto">
                {exerciseLoadingId && (
                  <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2">
                    <Activity className="h-4 w-4 animate-spin text-lime-500" />
                    <span>กำลังโหลดท่าฝึก...</span>
                  </div>
                )}

                {exerciseError && !exerciseLoadingId && (
                  <div className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-100 px-3 py-3">
                    <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-rose-600 mb-0.5">
                        โหลดท่าฝึกไม่สำเร็จ
                      </p>
                      <p className="text-[11px] text-rose-500">
                        {exerciseError}
                      </p>
                    </div>
                  </div>
                )}

                {!exerciseLoadingId &&
                  !exerciseError &&
                  currentExercises.length === 0 && (
                    <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 px-4 py-6 text-center">
                      <Target className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        ยังไม่มีท่าฝึกที่ผูกกับกล้ามเนื้อนี้
                      </p>
                      <p className="text-[11px] text-gray-400">
                        สามารถเพิ่มท่าฝึกและระบุกล้ามเนื้อได้จากหน้า Exercises
                      </p>
                    </div>
                  )}

                {currentExercises.map((ex) => {
                  const diff =
                    ex.difficulty_level?.toLowerCase() || "intermediate";
                  const badge = INV_BADGE[diff] || INV_BADGE.secondary;
                  const imgUrl = getImageUrl({
                    id: ex.id,
                    exercise_name: ex.exercise_name,
                    movement_pattern: ex.movement_pattern,
                    movement_type: ex.movement_type,
                    difficulty_level: ex.difficulty_level,
                    is_compound: ex.is_compound,
                    description: "",
                    image_url: ex.image_url,
                    image_full_url: ex.image_full_url,
                    video_url: null,
                    created_at: "",
                    updated_at: "",
                  } as any);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleOpenExercise(ex.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-50/50 border border-transparent hover:border-lime-200 hover:bg-lime-50/60 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={ex.exercise_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Target className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {ex.exercise_name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {ex.movement_pattern.toUpperCase()} •{" "}
                          {ex.movement_type}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={[
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              badge.bg,
                              badge.text,
                            ].join(" ")}
                          >
                            {ex.difficulty_level}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ใช้งาน {ex.activation_percentage}% (
                            {ex.involvement_type})
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Activity,
  Clock,
  Sparkles,
  Copy,
} from "lucide-react";
import { cn } from "../../utils/cn";
import {
  PageLoader,
  Pagination,
  Button,
  Drawer,
  Input,
  Select,
  ToastContainer,
  useToasts,
} from "../../components/ui";
import { exerciseApi } from "../../services/ExerciseAPI";
import type {
  DifficultyLevel,
  MovementPattern,
  ExerciseDrawerMode as DrawerMode,
  ExerciseDisplay,
  ExerciseFormData,
  ExerciseSortKey as SortKey,
} from "../../types/exercise.types";
import {
  ExerciseList,
  DrawerViewContent,
  DrawerFormContent,
  ExerciseDeleteConfirm,
} from "../../components/Exercises";
import { toTitle, formatDate, mapToDisplay } from "../../utils/exercise.utils";
import { useAuth } from "../../hooks/useAuth";

const PAGE_SIZE = 12;
const emptyForm: ExerciseFormData = {
  exercise_name: "",
  movement_type: "compound",
  movement_pattern: "push",
  description: "",
  difficulty_level: "beginner",
  is_compound: true,
  image_key: null,
  video_url: "",
  muscles: [],
  equipment: [],
};

export default function ExercisesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [exercises, setExercises] = useState<ExerciseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [patternFilter, setPatternFilter] = useState<MovementPattern | "ALL">(
    "ALL",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | "ALL"
  >("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("updatedDesc");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("VIEW");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [displayExercise, setDisplayExercise] =
    useState<ExerciseDisplay | null>(null);
  const [viewKey, setViewKey] = useState(0);

  const [drawerTitle, setDrawerTitle] = useState("");
  const [titleVisible, setTitleVisible] = useState(true);

  const [form, setForm] = useState<ExerciseFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ExerciseFormData, string>> & { _general?: string }
  >({});
  const [submitting, setSubmitting] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();
  const [searchParams] = useSearchParams();
  const initialLinkHandled = useRef(false);

  const [substitutes, setSubstitutes] = useState<
    import("../../types/exercise.types").SubstituteEntry[] | null
  >(null);
  const [substitutesLoading, setSubstitutesLoading] = useState(false);
  const [substitutesError, setSubstitutesError] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await exerciseApi.getAll();
      setExercises(response.exercises.map(mapToDisplay));
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "ไม่สามารถโหลดท่าฝึกได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    if (selectedId) {
      const updated = exercises.find((e) => e.id === selectedId);
      if (updated) setDisplayExercise(updated);
    }
  }, [exercises, selectedId]);

  const filteredExercises = useMemo(() => {
    let result = [...exercises];
    const query = (searchQuery || "").trim().toLowerCase();
    if (query) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.movementPattern.toLowerCase().includes(query) ||
          e.movementType.toLowerCase().includes(query),
      );
    }
    if (patternFilter !== "ALL")
      result = result.filter((e) => e.movementPattern === patternFilter);
    if (difficultyFilter !== "ALL")
      result = result.filter((e) => e.difficulty === difficultyFilter);
    result.sort((a, b) => {
      if (sortKey === "nameAsc") return a.name.localeCompare(b.name);
      if (sortKey === "patternAsc")
        return a.movementPattern.localeCompare(b.movementPattern);
      const aTs = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTs = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTs - aTs;
    });
    return result;
  }, [exercises, searchQuery, patternFilter, difficultyFilter, sortKey]);

  const paginatedExercises = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredExercises.slice(start, start + PAGE_SIZE);
  }, [filteredExercises, page]);

  const totalPages = Math.ceil(filteredExercises.length / PAGE_SIZE);

  const selectedExercise = useMemo(
    () => exercises.find((e) => e.id === selectedId) || null,
    [exercises, selectedId],
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, patternFilter, difficultyFilter, sortKey]);

  const openCreate = useCallback(() => {
    if (!["trainer", "admin", "root"].includes(user?.role || "")) return;
    setForm(emptyForm);
    setFormErrors({});
    setDrawerMode("CREATE");
    setSelectedId(null);
    setDisplayExercise(null);
    setDrawerOpen(true);
  }, [user?.role]);

  const navigateToExercise = useCallback(
    (id: number, isAlreadyOpen: boolean) => {
      const next = exercises.find((e) => e.id === id);
      if (!next) return;

      setDrawerMode("VIEW");
      setSelectedId(id);
      setSubstitutes(null);
      setSubstitutesError(null);

      if (!isAlreadyOpen) {
        setDisplayExercise(next);
        setDrawerTitle(next.name);
        setTitleVisible(true);
        setViewKey((k) => k + 1);
        setDrawerOpen(true);
        return;
      }

      setTitleVisible(false);
      setTimeout(() => {
        setDisplayExercise(next);
        setDrawerTitle(next.name);
        setViewKey((k) => k + 1);
        setTitleVisible(true);
      }, 160);
    },
    [exercises],
  );

  const openView = useCallback(
    (id: number) => {
      navigateToExercise(id, drawerOpen && drawerMode === "VIEW");
    },
    [navigateToExercise, drawerOpen, drawerMode],
  );

  // Handle deep linking from URL params
  useEffect(() => {
    if (!loading && exercises.length > 0 && !initialLinkHandled.current) {
      const idParam = searchParams.get("id");
      const searchParam = searchParams.get("search");

      if (searchParam) {
        setSearchQuery(searchParam);
      }

      if (idParam) {
        const id = parseInt(idParam);
        if (!isNaN(id)) {
          // Find the exercise to ensure it exists
          const exists = exercises.some((e) => e.id === id);
          if (exists) {
            setTimeout(() => {
              openView(id);
            }, 100);
          }
        }
      }
      initialLinkHandled.current = true;
    }
  }, [loading, exercises, searchParams, openView]);

  useEffect(() => {
    if (drawerMode === "VIEW" && selectedExercise) {
      setDrawerTitle(selectedExercise.name);
    } else if (drawerMode === "CREATE") {
      setDrawerTitle("สร้างท่าฝึก");
    } else if (drawerMode === "EDIT") {
      setDrawerTitle("แก้ไขท่าฝึก");
    }
  }, [drawerMode, selectedExercise]);

  const openEdit = useCallback(
    (id: number) => {
      const exercise = exercises.find((e) => e.id === id);
      if (!exercise) return;
      let imageKey: string | null = null;
      if (exercise.image) {
        const match = exercise.image.match(/\/api\/v1\/media\/(.+)$/);
        if (match) imageKey = match[1];
      }
      setForm({
        exercise_name: exercise.name,
        movement_type: exercise.movementType,
        movement_pattern: exercise.movementPattern,
        description: exercise.description,
        difficulty_level: exercise.difficulty,
        is_compound: exercise.isCompound,
        image_key: imageKey,
        video_url: exercise.videoUrl || "",
        muscles: [],
        equipment: [],
      });

      // Fetch additional details
      Promise.all([
        exerciseApi.getMuscles(id),
        exerciseApi.getEquipment(id)
      ]).then(([muscleRes, equipmentRes]) => {
        setForm(prev => ({
          ...prev,
          muscles: (muscleRes.muscles || []).map(m => ({
            muscle_id: m.id,
            involvement_type: m.involvement_type,
            activation_percentage: m.activation_percentage || 0,
          })),
          equipment: (equipmentRes.equipment || []).map(e => ({
            equipment_id: e.id,
            is_required: e.is_required,
          })),
        }));
      }).catch(err => {
        console.error("Failed to fetch detailed exercise data", err);
      });

      setFormErrors({});
      setDrawerMode("EDIT");
      setSelectedId(id);
      setDrawerOpen(true);
    },
    [exercises],
  );

  const openClone = useCallback(
    async (id: number) => {
      const exercise = exercises.find((e) => e.id === id);
      if (!exercise) return;
      let imageKey: string | null = null;
      if (exercise.image) {
        const match = exercise.image.match(/\/api\/v1\/media\/(.+)$/);
        if (match) imageKey = match[1];
      }
      setForm({
        exercise_name: `${exercise.name} (คัดลอก)`,
        movement_type: exercise.movementType,
        movement_pattern: exercise.movementPattern,
        description: exercise.description,
        difficulty_level: exercise.difficulty,
        is_compound: exercise.isCompound,
        image_key: imageKey,
        video_url: exercise.videoUrl || "",
        muscles: [],
        equipment: [],
      });

      // Fetch additional details for cloning
      Promise.all([
        exerciseApi.getMuscles(id),
        exerciseApi.getEquipment(id)
      ]).then(([muscleRes, equipmentRes]) => {
        setForm(prev => ({
          ...prev,
          muscles: (muscleRes.muscles || []).map(m => ({
            muscle_id: m.id,
            involvement_type: m.involvement_type,
            activation_percentage: m.activation_percentage || 0,
          })),
          equipment: (equipmentRes.equipment || []).map(e => ({
            equipment_id: e.id,
            is_required: e.is_required,
          })),
        }));
      }).catch(err => {
        console.error("Failed to fetch detailed exercise data for clone", err);
      });

      setFormErrors({});
      setDrawerMode("CREATE");
      setSelectedId(null);
      setDrawerOpen(true);
    },
    [exercises],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setFormErrors({});
    setConfirmDeleteId(null);
    setSelectedId(null);
    setDisplayExercise(null);
    setTitleVisible(true);
  }, []);

  const fetchSubstitutes = useCallback(async (id: number) => {
    setSubstitutes(null);
    setSubstitutesError(null);
    setSubstitutesLoading(true);
    try {
      const res = await exerciseApi.getSubstitutes(id, { limit: 6 });
      setSubstitutes(res.substitutes || []);
    } catch (err: any) {
      setSubstitutesError(
        err?.response?.data?.error ||
        err?.message ||
        "ไม่สามารถโหลดตัวทดแทนได้",
      );
    } finally {
      setSubstitutesLoading(false);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof ExerciseFormData, string>> & {
      _general?: string;
    } = {};
    if (!(form.exercise_name || "").trim())
      errors.exercise_name = "กรุณากรอกชื่อท่าฝึก";
    else if ((form.exercise_name || "").trim().length < 2)
      errors.exercise_name = "ชื่อท่าฝึกต้องมีอย่างน้อย 2 ตัวอักษร";
    if (!(form.description || "").trim()) errors.description = "กรุณากรอกคำอธิบาย";
    if (!form.movement_pattern)
      errors.movement_pattern = "กรุณาเลือกรูปแบบการเคลื่อนไหว";
    if (!(form.movement_type || "").trim())
      errors.movement_type = "กรุณากรอกประเภทการเคลื่อนไหว";

    const totalActivation = (form.muscles || []).reduce(
      (sum, m) => sum + (m.activation_percentage || 0),
      0
    );
    if (form.muscles && form.muscles.length > 0 && totalActivation !== 100) {
      errors._general = `สัดส่วนการใช้กล้ามเนื้อรวมกันต้องเท่ากับ 100% (ปัจจุบัน ${totalActivation}%)`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const payload: any = {
        exercise_name: toTitle((form.exercise_name || "").trim()),
        movement_type: (form.movement_type || "").trim(),
        movement_pattern: form.movement_pattern,
        description: (form.description || "").trim(),
        difficulty_level: form.difficulty_level,
        is_compound: form.is_compound,
        image_url: form.image_key,
        video_url: (form.video_url || "").trim() || null,
        muscles: form.muscles,
        equipment: form.equipment,
      };
      if (drawerMode === "CREATE") await exerciseApi.create(payload);
      else if (drawerMode === "EDIT" && selectedId)
        await exerciseApi.update(selectedId, payload);
      await loadExercises();
      addToast(
        "success",
        drawerMode === "CREATE"
          ? "สร้างท่าฝึกใหม่สำเร็จ"
          : "บันทึกการแก้ไขท่าฝึกแล้ว",
      );
      closeDrawer();
    } catch (err: any) {
      setFormErrors({
        _general:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          `ไม่สามารถ${drawerMode === "CREATE" ? "สร้าง" : "อัปเดต"}ท่าฝึกได้`,
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    form,
    drawerMode,
    selectedId,
    validateForm,
    loadExercises,
    closeDrawer,
    addToast,
  ]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirmDeleteId !== id) {
        setConfirmDeleteId(id);
        return;
      }
      try {
        setSubmitting(true);
        await exerciseApi.delete(id);
        await loadExercises();
        if (selectedId === id) closeDrawer();
        setConfirmDeleteId(null);
        addToast("success", "ลบท่าฝึกสำเร็จ");
      } catch (err: any) {
        alert(
          err?.response?.data?.error || err?.message || "ไม่สามารถลบท่าฝึกได้",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [confirmDeleteId, selectedId, loadExercises, closeDrawer, addToast],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setPatternFilter("ALL");
    setDifficultyFilter("ALL");
  };

  if (loading) return <PageLoader message="กำลังโหลดข้อมูล..." />;

  if (error && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ไม่สามารถโหลดท่าฝึกได้
          </h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={loadExercises}>ลองอีกครั้ง</Button>
        </div>
      </div>
    );
  }

  const hasFilters =
    searchQuery || patternFilter !== "ALL" || difficultyFilter !== "ALL";
  const canManage = ["trainer", "admin", "root"].includes(user?.role || "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-xs font-bold text-gray-400 uppercase  mb-1">
                GYMMATE
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ">
                คลังท่าฝึก (Exercises)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                จำนวนท่าฝึกทั้งหมด: {exercises.length} ท่า
              </p>
            </div>
            {canManage && (
              <Button
                onClick={openCreate}
                className="shrink-0 bg-lime-500 hover:bg-lime-600 border-none shadow-lime-500/20 px-6 h-11 rounded-2xl w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                <span>เพิ่มท่าฝึกใหม่</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-lime-500 transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="ค้นหาตามชื่อ หรือรูปแบบการเล่น..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-white border-gray-100 rounded-xl focus:ring-lime-500/10 focus:border-lime-400 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:flex lg:items-center">
            {[
              {
                value: patternFilter,
                setter: setPatternFilter,
                options: [
                  { l: "ทุกรูปแบบ", v: "ALL" },
                  { l: "Push", v: "push" },
                  { l: "Pull", v: "pull" },
                  { l: "Squat", v: "squat" },
                  { l: "Hinge", v: "hinge" },
                  { l: "Carry", v: "carry" },
                ],
              },
              {
                value: difficultyFilter,
                setter: setDifficultyFilter,
                options: [
                  { l: "ทุกระดับ", v: "ALL" },
                  { l: "เริ่มต้น", v: "beginner" },
                  { l: "ปานกลาง", v: "intermediate" },
                  { l: "ขั้นสูง", v: "advanced" },
                ],
              },
              {
                value: sortKey,
                setter: setSortKey,
                options: [
                  { l: "อัปเดตล่าสุด", v: "updatedDesc" },
                  { l: "ชื่อ A-Z", v: "nameAsc" },
                ],
              },
            ].map(({ value, setter, options }, i) => (
              <Select
                key={i}
                value={value}
                onChange={(e) => setter(e.target.value as any)}
                className="h-11 min-w-0 lg:min-w-[130px]  text-sm uppercase  border-gray-100 bg-white rounded-xl focus:border-lime-400 transition-all shadow-sm"
              >
                {options.map((opt) => (
                  <option key={opt.v} value={opt.v}>
                    {opt.l}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="bg-transparent">
          {filteredExercises.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <Activity className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hasFilters ? "ไม่พบท่าฝึกที่ค้นหา" : "ยังไม่มีท่าฝึกในระบบ"}
              </h3>
              <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
                {hasFilters
                  ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง"
                  : "เริ่มต้นจัดการห้องสมุดท่าฝึกของคุณได้ที่นี่"}
              </p>
              {hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  className="px-8 rounded-xl font-bold"
                >
                  ล้างการค้นหา
                </Button>
              ) : (
                canManage && (
                  <Button
                    onClick={openCreate}
                    className="bg-lime-500 border-none px-8 rounded-xl font-bold"
                  >
                    เพิ่มท่าฝึกแรก
                  </Button>
                )
              )}
            </div>
          ) : (
            <ExerciseList
              exercises={paginatedExercises}
              onView={openView}
              onEdit={openEdit}
              onDelete={(id) => setConfirmDeleteId(id)}
              canManage={canManage}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredExercises.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        title={
          <span
            style={{
              display: "inline-block",
              transition: "opacity 160ms ease, transform 160ms ease",
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? "translateY(0)" : "translateY(-6px)",
            }}
            className="uppercase font-bold "
          >
            {drawerMode === "VIEW"
              ? drawerTitle
              : drawerMode === "CREATE"
                ? "สร้างท่าฝึกใหม่"
                : "แก้ไขข้อมูลท่าฝึก"}
          </span>
        }
        subtitle={
          <span className="text-sm font-bold text-gray-400 uppercase ">
            {drawerMode === "VIEW"
              ? "รายละเอียดท่าฝึก"
              : drawerMode === "CREATE"
                ? "เพิ่มท่าฝึกใหม่"
                : "แก้ไขข้อมูลท่าฝึก"}
          </span>
        }
        onClose={closeDrawer}
        footer={
          drawerMode === "VIEW" ? (
            <div className="w-full space-y-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase ">
                    {formatDate(selectedExercise?.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-xs font-bold uppercase ">
                    Modified {formatDate(selectedExercise?.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedExercise && (
                  <>
                    {canManage && (
                      <Button
                        variant="secondary"
                        onClick={() => openEdit(selectedExercise.id)}
                        className="flex-1 px-3 h-11"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="truncate">แก้ไข</span>
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      onClick={() => fetchSubstitutes(selectedExercise.id)}
                      className="h-11 w-11 p-0 shrink-0"
                      title="AI Substitutes"
                      loading={substitutesLoading}
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>

                    {canManage && (
                      <Button
                        variant="secondary"
                        onClick={() => openClone(selectedExercise.id)}
                        className="h-11 w-11 p-0 shrink-0"
                        title="คัดลอกท่าฝึก"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}

                    {canManage && (
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(selectedExercise.id)}
                        disabled={submitting}
                        loading={
                          submitting && confirmDeleteId === selectedExercise.id
                        }
                        className={cn(
                          "h-11 shrink-0",
                          confirmDeleteId === selectedExercise.id
                            ? "flex-1 sm:max-w-[180px]"
                            : "w-11 p-0",
                        )}
                        title="ลบท่าฝึก"
                      >
                        <Trash2 className="h-4 w-4" />
                        {confirmDeleteId === selectedExercise.id && (
                          <span className="ml-1 text-sm font-bold truncate">
                            ยืนยันการลบ
                          </span>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={closeDrawer}
                disabled={submitting}
                className="flex-1 h-12 rounded-2xl border border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] h-12 rounded-2xl bg-lime-500 text-white font-bold uppercase  text-sm hover:bg-lime-600 transition-all active:scale-95 shadow-lg shadow-lime-200 disabled:opacity-50"
              >
                {submitting
                  ? "กำลังบันทึก..."
                  : drawerMode === "CREATE"
                    ? "สร้างท่าฝึก"
                    : "บันทึกการแก้ไข"}
              </button>
            </div>
          )
        }
      >
        {drawerMode === "VIEW" ? (
          displayExercise ? (
            <DrawerViewContent
              key={viewKey}
              exercise={displayExercise}
              substitutes={substitutes}
              substitutesLoading={substitutesLoading}
              substitutesError={substitutesError}
              onOpenView={openView}
            />
          ) : (
            <div className="py-20 text-center">
              <Activity className="h-12 w-12 text-gray-100 mx-auto mb-4" />
              <p className="text-xs font-bold text-gray-300 uppercase ">
                ยังไม่ได้เลือกท่าฝึก
              </p>
            </div>
          )
        ) : (
          <DrawerFormContent
            form={form}
            formErrors={formErrors}
            drawerMode={drawerMode}
            selectedExercise={selectedExercise}
            submitting={submitting}
            onFormChange={(next) => setForm((p) => ({ ...p, ...next }))}
          />
        )}
      </Drawer>

      {confirmDeleteId && confirmDeleteId !== selectedId && (
        <ExerciseDeleteConfirm
          confirmDeleteId={confirmDeleteId}
          submitting={submitting}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

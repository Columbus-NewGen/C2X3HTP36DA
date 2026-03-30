import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import {
  AlertCircle,
  Clock,
  Copy,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  PageLoader,
  Pagination,
  Button,
  Drawer,
  ToastContainer,
  useToasts,
} from "../../components/ui";
import { programAPI } from "../../services/ProgramsAPI";
import { userProgramsApi } from "../../services/userProgramsApi";
import { usersApi } from "../../services/UsersAPI";
import { exerciseApi } from "../../services/ExerciseAPI";
import { cn } from "../../utils/cn";
import type {
  ProgramDetail,
  DifficultyLevel,
  CreateProgramPayload,
  UpdateProgramPayload,
  GetProgramsParams,
  ProgramSessionPayload,
  ProgramExercisePayload,
} from "../../types/program.types";
import type { Exercise } from "../../types/exercise.types";
import { formatDate, mapToDisplay, todayYmd } from "../../utils/programs.utils";
import type {
  AssignFormData,
  AssignFormErrors,
  DrawerMode,
  ProgramDisplay,
  ProgramFormData,
  ProgramFormErrors,
  SortKey,
} from "../../utils/programs.utils";
import {
  AssignProgramDrawer,
  ProgramDeleteConfirm,
  ProgramFilters,
  ProgramFormDrawerContent,
  ProgramHeader,
  ProgramList,
  ProgramViewDrawerContent,
} from "../../components/Programs";

export default function ProgramsPage() {
  const { user } = useAuth();
  // State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [programs, setPrograms] = useState<ProgramDisplay[]>([]);
  const [programDetail, setProgramDetail] = useState<ProgramDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | "ALL"
  >("ALL");
  const [templateFilter, setTemplateFilter] = useState<boolean | "ALL">(true); // true = template, false = program
  const [sortKey, setSortKey] = useState<SortKey>("updatedDesc");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("VIEW");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form state
  const emptyForm: ProgramFormData = {
    program_name: "",
    goal: "general fitness",
    duration_weeks: 4,
    is_template: true,
    difficulty_level: "beginner",
    days_per_week: 3,
    description: "",
  };
  const [form, setForm] = useState<ProgramFormData>(emptyForm);
  const [sessionsForm, setSessionsForm] = useState<ProgramSessionPayload[]>([]);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [formErrors, setFormErrors] = useState<ProgramFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedSessionIdx, setExpandedSessionIdx] = useState<number | null>(
    0,
  );

  // Assign drawer state
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [assignProgram, setAssignProgram] = useState<ProgramDisplay | null>(
    null,
  );
  const [assignForm, setAssignForm] = useState<AssignFormData>({
    userId: "",
    programName: "",
    startDate: todayYmd(),
    notes: "",
  });
  const [assignErrors, setAssignErrors] = useState<AssignFormErrors>({});
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignProgramDetail, setAssignProgramDetail] = useState<ProgramDetail | null>(null);
  const [loadingAssignDetail, setLoadingAssignDetail] = useState(false);
  const [assignForSelf, setAssignForSelf] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();

  // User lookup for assignment
  const userIdForLookup = useMemo(() => {
    const id = parseInt(assignForm.userId);
    return isNaN(id) ? null : id;
  }, [assignForm.userId]);

  const { data: lookedUpUser, isLoading: isLookingUpUser } = useQuery({
    queryKey: ["user-lookup", userIdForLookup],
    queryFn: () => usersApi.getUserById(userIdForLookup!),
    enabled: !!userIdForLookup,
    retry: false,
    staleTime: 300_000,
  });

  // Load programs
  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: GetProgramsParams = {};
      if (difficultyFilter !== "ALL") {
        params.difficulty = difficultyFilter;
      }
      if (templateFilter !== "ALL") {
        params.is_template = templateFilter;
      }
      const response = await programAPI.getList(params);
      const displayPrograms = response.map(mapToDisplay);
      setPrograms(displayPrograms);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "ไม่สามารถโหลดโปรแกรมได้";
      setError(errorMessage);
      console.error("Failed to load programs:", err);
    } finally {
      setLoading(false);
    }
  }, [difficultyFilter, templateFilter]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Load program detail
  const loadProgramDetail = useCallback(async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail = await programAPI.getById(id);
      setProgramDetail(detail);
      return detail;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "ไม่สามารถโหลดรายละเอียดโปรแกรมได้";
      setError(errorMessage);
      console.error("Failed to load program detail:", err);
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Filtered & sorted programs
  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    // Search filter
    const query = (searchQuery || "").trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.goal.toLowerCase().includes(query),
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortKey === "nameAsc") {
        return a.name.localeCompare(b.name);
      }
      if (sortKey === "difficultyAsc") {
        return a.difficulty.localeCompare(b.difficulty);
      }
      // updatedDesc
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [programs, searchQuery, sortKey]);

  const paginatedPrograms = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPrograms.slice(start, end);
  }, [filteredPrograms, page]);

  const totalPages = Math.ceil(filteredPrograms.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortKey]);

  // Selected program
  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedId) || null,
    [programs, selectedId],
  );

  const openAssign = useCallback(async (program: ProgramDisplay) => {
    setAssignForSelf(false);
    setAssignProgram(program);
    setAssignProgramDetail(null);
    setAssignForm({
      userId: "",
      programName: program.name,
      startDate: todayYmd(),
      notes: "",
    });
    setAssignErrors({});
    setAssignDrawerOpen(true);
    setLoadingAssignDetail(true);
    try {
      const detail = await programAPI.getById(program.id);
      setAssignProgramDetail(detail);
    } catch {
      // non-critical — calendar just won't show
    } finally {
      setLoadingAssignDetail(false);
    }
  }, []);

  /** Open assign drawer for self (member): pick start date + calendar, then assign to current user */
  const openAssignForSelf = useCallback(
    async (program: ProgramDisplay, existingDetail: ProgramDetail | null = null) => {
      setAssignForSelf(true);
      setAssignProgram(program);
      setAssignProgramDetail(existingDetail ?? null);
      setAssignForm({
        userId: "",
        programName: program.name,
        startDate: todayYmd(),
        notes: "",
      });
      setAssignErrors({});
      setAssignDrawerOpen(true);
      if (existingDetail && existingDetail.id === program.id) {
        setLoadingAssignDetail(false);
        return;
      }
      setLoadingAssignDetail(true);
      try {
        const detail = await programAPI.getById(program.id);
        setAssignProgramDetail(detail);
      } catch {
        // non-critical
      } finally {
        setLoadingAssignDetail(false);
      }
    },
    [],
  );

  // Load exercises for create form
  const loadExercises = useCallback(async () => {
    try {
      setLoadingExercises(true);
      const res = await exerciseApi.getAll();
      setExercisesList(res.exercises || []);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      setExercisesList([]);
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  // Drawer handlers
  const openCreate = useCallback(() => {
    if (!["trainer", "admin", "root"].includes(user?.role || "")) return;
    setForm(emptyForm);
    setSessionsForm([]);
    setFormErrors({});
    setDrawerMode("CREATE");
    setSelectedId(null);
    setProgramDetail(null);
    setExpandedSessionIdx(0);
    setDrawerOpen(true);
    loadExercises();
  }, [emptyForm, loadExercises, user?.role]);

  const openView = useCallback(
    async (id: number) => {
      setDrawerMode("VIEW");
      setSelectedId(id);
      setFormErrors({});
      setDrawerOpen(true);
      await loadProgramDetail(id);
    },
    [loadProgramDetail],
  );

  const openEdit = useCallback(
    async (id: number) => {
      const program = programs.find((p) => p.id === id);
      if (!program) return;

      // Load detail for edit
      const detail = await loadProgramDetail(id);
      if (!detail) return;

      setForm({
        program_name: program.name,
        goal: program.goal,
        duration_weeks: program.durationWeeks,
        is_template: program.isTemplate,
        difficulty_level: program.difficulty,
        days_per_week: program.daysPerWeek,
        description: program.description,
      });

      // Map detail sessions to form sessions
      if (detail.sessions) {
        const mappedSessions: ProgramSessionPayload[] = detail.sessions.map(
          (s) => ({
            session_name: s.session_name,
            workout_split: s.workout_split,
            day_of_week: s.day_of_week,
            day_number: s.day_number,
            notes: s.notes || "",
            exercises: (s.exercises || []).map((e) => ({
              exercise_id: e.exercise_id,
              sets: e.sets,
              reps: e.reps,
              weight: e.weight,
              rest_seconds: e.rest_seconds,
              order_sequence: e.order_sequence,
            })),
          }),
        );
        setSessionsForm(mappedSessions);
      } else {
        setSessionsForm([]);
      }

      setFormErrors({});
      setDrawerMode("EDIT");
      setSelectedId(id);
      setExpandedSessionIdx(0);
      setDrawerOpen(true);
      loadExercises();
    },
    [programs, loadProgramDetail, loadExercises],
  );

  const openClone = useCallback(
    async (id: number) => {
      // Load detail for clone
      const detail = await loadProgramDetail(id);
      if (!detail) return;

      setForm({
        program_name: `${detail.program_name} (คัดลอก)`,
        goal: detail.goal,
        duration_weeks: detail.duration_weeks,
        is_template: detail.is_template,
        difficulty_level: detail.difficulty_level,
        days_per_week: detail.days_per_week,
        description: detail.description,
      });

      // Map detail sessions to form sessions
      if (detail.sessions) {
        const mappedSessions: ProgramSessionPayload[] = detail.sessions.map(
          (s) => ({
            session_name: s.session_name,
            workout_split: s.workout_split,
            day_of_week: s.day_of_week,
            day_number: s.day_number,
            notes: s.notes || "",
            exercises: (s.exercises || []).map((e) => ({
              exercise_id: e.exercise_id,
              sets: e.sets,
              reps: e.reps,
              weight: e.weight,
              rest_seconds: e.rest_seconds,
              order_sequence: e.order_sequence,
            })),
          }),
        );
        setSessionsForm(mappedSessions);
      } else {
        setSessionsForm([]);
      }

      setFormErrors({});
      setDrawerMode("CREATE");
      setSelectedId(null);
      setExpandedSessionIdx(0);
      setDrawerOpen(true);
      loadExercises();
    },
    [loadProgramDetail, loadExercises],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setFormErrors({});
    setConfirmDeleteId(null);
    setSelectedId(null);
    setProgramDetail(null);
  }, []);

  const closeAssignDrawer = useCallback(() => {
    setAssignDrawerOpen(false);
    setAssignErrors({});
    setAssignProgram(null);
    setAssignProgramDetail(null);
    setAssignForSelf(false);
  }, []);

  const validateAssignForm = useCallback(
    (forSelf: boolean = false): boolean => {
      const errors: AssignFormErrors = {};

      if (!assignProgram) {
        errors._general = "ไม่พบโปรแกรมสำหรับการมอบหมาย";
      }

      if (!forSelf) {
        if (!(assignForm.userId || "").trim()) {
          errors.userId = "กรุณากรอก User ID";
        } else if (!/^\d+$/.test((assignForm.userId || "").trim())) {
          errors.userId = "User ID ต้องเป็นตัวเลข";
        }
      }

      if (!(assignForm.programName || "").trim()) {
        errors.programName = "กรุณากรอกชื่อโปรแกรมสำหรับผู้ใช้";
      }

      if (!assignForm.startDate) {
        errors.startDate = "กรุณาเลือกวันที่เริ่มต้น";
      }

      setAssignErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [assignForm, assignProgram],
  );

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: ProgramFormErrors = {};

    if (!(form.program_name || "").trim()) {
      errors.program_name = "กรุณากรอกชื่อโปรแกรม";
    } else if ((form.program_name || "").trim().length < 2) {
      errors.program_name = "ชื่อโปรแกรมต้องมีอย่างน้อย 2 ตัวอักษร";
    }

    if (form.duration_weeks < 1 || form.duration_weeks > 52) {
      errors.duration_weeks = "ระยะเวลาต้องอยู่ระหว่าง 1-52 สัปดาห์";
    }

    if (form.days_per_week < 1 || form.days_per_week > 7) {
      errors.days_per_week = "จำนวนวันต่อสัปดาห์ต้องอยู่ระหว่าง 1-7 วัน";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Add/remove session in create form
  const addSession = useCallback(() => {
    const dayNum = sessionsForm.length + 1;
    setSessionsForm((prev) => [
      ...prev,
      {
        session_name: `วันฝึก ${dayNum}`,
        workout_split: "Full Body",
        day_number: dayNum,
        notes: "",
        exercises: [],
      },
    ]);
    setExpandedSessionIdx(sessionsForm.length);
  }, [sessionsForm.length]);

  const removeSession = useCallback((idx: number) => {
    setSessionsForm((prev) => prev.filter((_, i) => i !== idx));
    setExpandedSessionIdx((p) =>
      p === idx ? null : p != null && p > idx ? p - 1 : p,
    );
  }, []);

  const updateSession = useCallback(
    (idx: number, patch: Partial<ProgramSessionPayload>) => {
      setSessionsForm((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const addExercise = useCallback(
    (sessionIdx: number) => {
      const exs = sessionsForm[sessionIdx]?.exercises ?? [];
      const orderSequence = exs.length + 1;
      const firstExId = exercisesList[0]?.id ?? 1;
      setSessionsForm((prev) =>
        prev.map((s, i) =>
          i === sessionIdx
            ? {
              ...s,
              exercises: [
                ...s.exercises,
                {
                  exercise_id: firstExId,
                  sets: 3,
                  reps: 10,
                  rest_seconds: 90,
                  order_sequence: orderSequence,
                },
              ],
            }
            : s,
        ),
      );
    },
    [sessionsForm, exercisesList],
  );

  const removeExercise = useCallback((sessionIdx: number, exIdx: number) => {
    setSessionsForm((prev) =>
      prev.map((s, i) =>
        i === sessionIdx
          ? {
            ...s,
            exercises: s.exercises
              .filter((_, ei) => ei !== exIdx)
              .map((e, ei) => ({ ...e, order_sequence: ei + 1 })),
          }
          : s,
      ),
    );
  }, []);

  const updateExercise = useCallback(
    (
      sessionIdx: number,
      exIdx: number,
      patch: Partial<ProgramExercisePayload>,
    ) => {
      setSessionsForm((prev) =>
        prev.map((s, i) =>
          i === sessionIdx
            ? {
              ...s,
              exercises: s.exercises.map((e, ei) =>
                ei === exIdx ? { ...e, ...patch } : e,
              ),
            }
            : s,
        ),
      );
    },
    [],
  );

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      if (drawerMode === "CREATE") {
        const payload: CreateProgramPayload = {
          program_name: (form.program_name || "").trim(),
          goal: form.goal,
          duration_weeks: form.duration_weeks,
          is_template: form.is_template,
          difficulty_level: form.difficulty_level,
          days_per_week: form.days_per_week,
          description: (form.description || "").trim(),
          sessions: sessionsForm.map((s) => ({
            ...s,
            exercises: s.exercises.map((e, i) => ({
              ...e,
              order_sequence: i + 1,
            })),
          })),
        };
        await programAPI.create(payload);
      } else if (drawerMode === "EDIT" && selectedId) {
        const payload: UpdateProgramPayload = {
          program_name: (form.program_name || "").trim(),
          goal: form.goal,
          duration_weeks: form.duration_weeks,
          difficulty_level: form.difficulty_level,
          days_per_week: form.days_per_week,
          description: (form.description || "").trim(),
          is_template: form.is_template,
          sessions: sessionsForm.map((s) => ({
            ...s,
            exercises: s.exercises.map((e, i) => ({
              ...e,
              order_sequence: i + 1,
            })),
          })),
        };
        await programAPI.update(selectedId, payload);
      }

      await loadPrograms();
      addToast(
        "success",
        drawerMode === "CREATE"
          ? "สร้างโปรแกรมใหม่สำเร็จ"
          : "บันทึกการแก้ไขโปรแกรมแล้ว",
      );
      closeDrawer();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        `ไม่สามารถ${drawerMode === "CREATE" ? "สร้าง" : "อัปเดต"}โปรแกรมได้`;
      setFormErrors({ _general: errorMessage });
      console.error(`Failed to ${drawerMode} program:`, err);
    } finally {
      setSubmitting(false);
    }
  }, [
    form,
    sessionsForm,
    drawerMode,
    selectedId,
    validateForm,
    loadPrograms,
    closeDrawer,
  ]);

  const handleAssignSubmit = useCallback(async () => {
    if (!assignProgram) {
      setAssignErrors({
        _general: "ไม่พบโปรแกรมสำหรับการมอบหมาย",
      });
      return;
    }

    const isSelf = assignForSelf && !!user;
    if (!validateAssignForm(isSelf)) return;

    setAssignSubmitting(true);
    setAssignErrors({});

    try {
      const payload = {
        template_program_id: assignProgram.id,
        program_name: (assignForm.programName || "").trim(),
        start_date: assignForm.startDate,
        ...((assignForm.notes || "").trim() ? { notes: (assignForm.notes || "").trim() } : {}),
      };

      const targetUserId = isSelf ? String(user!.id) : (assignForm.userId || "").trim();
      await userProgramsApi.assignToUser(targetUserId, payload);
      addToast(
        "success",
        isSelf ? "เพิ่มโปรแกรมนี้ให้กับบัญชีของคุณแล้ว" : "มอบหมายโปรแกรมสำเร็จ",
      );
      closeAssignDrawer();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        (isSelf ? "ไม่สามารถเพิ่มโปรแกรมให้กับบัญชีของคุณได้" : "ไม่สามารถมอบหมายโปรแกรมให้ผู้ใช้ได้");
      setAssignErrors({ _general: errorMessage });
      console.error("Failed to assign program:", err);
    } finally {
      setAssignSubmitting(false);
    }
  }, [
    assignProgram,
    assignForm,
    assignForSelf,
    user,
    validateAssignForm,
    closeAssignDrawer,
    addToast,
  ]);

  const handleCloneAndAssign = useCallback(async () => {
    if (!assignProgram || !lookedUpUser) return;
    setAssignSubmitting(true);
    setAssignErrors({});
    try {
      // 1. Clone
      const cloned = await programAPI.clone(assignProgram.id);
      // 2. Assign
      const payload = {
        template_program_id: cloned.id,
        program_name: (assignForm.programName || "").trim(),
        start_date: assignForm.startDate,
        ...((assignForm.notes || "").trim() ? { notes: (assignForm.notes || "").trim() } : {}),
      };
      await userProgramsApi.assignToUser((assignForm.userId || "").trim(), payload);
      addToast("success", "สร้างรายการใหม่และมอบหมายสำเร็จ");
      closeAssignDrawer();
      loadPrograms();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "ไม่สามารถ Clone & Assign ได้";
      setAssignErrors({ _general: errorMessage });
    } finally {
      setAssignSubmitting(false);
    }
  }, [
    assignProgram,
    lookedUpUser,
    assignForm,
    closeAssignDrawer,
    addToast,
    loadPrograms,
  ]);

  // Delete program
  const handleDelete = useCallback(
    async (id: number) => {
      if (confirmDeleteId !== id) {
        setConfirmDeleteId(id);
        return;
      }

      try {
        setSubmitting(true);
        await programAPI.delete(id);
        await loadPrograms();
        if (selectedId === id) {
          closeDrawer();
        }
        setConfirmDeleteId(null);
        addToast("success", "ลบโปรแกรมสำเร็จ");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "ไม่สามารถลบโปรแกรมได้";
        alert(errorMessage);
        console.error("Failed to delete program:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [confirmDeleteId, selectedId, loadPrograms, closeDrawer, addToast],
  );

  const handleFormChange = useCallback((patch: Partial<ProgramFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleAssignFormChange = useCallback(
    (patch: Partial<AssignFormData>) => {
      setAssignForm((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  // Render loading state
  if (loading) {
    return <PageLoader message="กำลังโหลดข้อมูล..." />;
  }

  // Render error state
  if (error && programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ไม่สามารถโหลดโปรแกรมได้
          </h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={loadPrograms}>ลองอีกครั้ง</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <ProgramHeader
          totalPrograms={programs.length}
          templateCount={programs.filter((p) => p.isTemplate).length}
          onCreate={openCreate}
        />

        {/* Error banner */}
        {error && programs.length > 0 && (
          <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs sm:text-sm font-bold text-amber-900">
                แจ้งเตือน
              </div>
              <div className="text-xs sm:text-sm text-amber-700 mt-0.5">
                {error}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 text-amber-600 hover:text-amber-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <ProgramFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          templateFilter={templateFilter}
          onTemplateChange={setTemplateFilter}
          sortKey={sortKey}
          onSortChange={setSortKey}
          totalFiltered={filteredPrograms.length}
          hasActiveFilters={
            difficultyFilter !== "ALL" ||
            templateFilter !== "ALL" ||
            !!searchQuery
          }
          onResetFilters={() => {
            setSearchQuery("");
            setDifficultyFilter("ALL");
            setTemplateFilter("ALL");
          }}
        />

        <ProgramList
          programs={paginatedPrograms}
          hasAnyPrograms={filteredPrograms.length > 0}
          searchQuery={searchQuery}
          difficultyFilter={difficultyFilter}
          templateFilter={templateFilter}
          onOpenView={openView}
          onOpenAssign={openAssign}
          onOpenEdit={openEdit}
          onClone={openClone}
          onDelete={handleDelete}
          canManage={["trainer", "admin", "root"].includes(user?.role || "")}
        />
        {/* Program Pagination */}
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredPrograms.length}
            pageSize={PAGE_SIZE}
          />
        </div>

        {/* Drawer */}
        <Drawer
          open={drawerOpen}
          title={
            drawerMode === "CREATE"
              ? "สร้างโปรแกรม"
              : drawerMode === "EDIT"
                ? "แก้ไขโปรแกรม"
                : selectedProgram?.name || "รายละเอียดโปรแกรม"
          }
          subtitle={
            drawerMode === "VIEW"
              ? "ดูรายละเอียดโปรแกรม"
              : drawerMode === "CREATE"
                ? "เพิ่มโปรแกรมใหม่ในไลบรารีของคุณ"
                : "อัปเดตข้อมูลโปรแกรม"
          }
          onClose={closeDrawer}
          footer={
            drawerMode === "VIEW" ? (
              <div className="w-full space-y-4">
                {/* Metadata Detail */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 opacity-30">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-bold uppercase ">
                      {formatDate(selectedProgram?.createdAt)}
                    </span>
                  </div>
                  <div className="h-px flex-1 mx-4 bg-gray-50" />
                  <div className="flex items-center gap-1.5 opacity-30">
                    <span className="text-xs font-bold uppercase ">
                      Update {formatDate(selectedProgram?.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons — Horizontal Row always */}
                <div className="flex items-center gap-2">
                  {selectedProgram && (
                    <>
                      {["trainer", "admin", "root"].includes(
                        user?.role || "",
                      ) && (
                          <Button
                            onClick={() => openAssign(selectedProgram)}
                            className="flex-1 bg-lime-500 hover:bg-lime-600 border-none shadow-lime-500/20 px-3 h-11"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="truncate">มอบหมาย</span>
                          </Button>
                        )}
                      {["trainer", "admin", "root"].includes(
                        user?.role || "",
                      ) && (
                          <Button
                            variant="secondary"
                            onClick={() => openEdit(selectedProgram.id)}
                            className="flex-1 px-3 h-11"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="truncate">แก้ไข</span>
                          </Button>
                        )}

                      {["trainer", "admin", "root"].includes(
                        user?.role || "",
                      ) && (
                          <Button
                            variant="secondary"
                            onClick={() => openClone(selectedProgram.id)}
                            className="h-11 w-11 p-0 shrink-0"
                            title="คัดลอกโปรแกรม"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}

                      {["trainer", "admin", "root"].includes(
                        user?.role || "",
                      ) && (
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(selectedProgram.id)}
                            disabled={submitting}
                            loading={
                              submitting && confirmDeleteId === selectedProgram.id
                            }
                            className={cn(
                              "h-11 shrink-0",
                              confirmDeleteId === selectedProgram.id
                                ? "flex-1 sm:max-w-[180px]"
                                : "w-11 p-0",
                            )}
                            title="ลบโปรแกรม"
                          >
                            <Trash2 className="h-4 w-4" />
                            {confirmDeleteId === selectedProgram.id && (
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  onClick={closeDrawer}
                  disabled={submitting}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  loading={submitting}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  {drawerMode === "CREATE"
                    ? "สร้างโปรแกรม"
                    : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </div>
            )
          }
        >
          {drawerMode === "VIEW" ? (
            <ProgramViewDrawerContent
              selectedProgram={selectedProgram}
              programDetail={programDetail}
              loadingDetail={loadingDetail}
              canSelfAssign={user?.role === "user"}
              onSelfAssign={() =>
                selectedProgram &&
                openAssignForSelf(selectedProgram, programDetail ?? null)
              }
              selfAssignLoading={false}
            />
          ) : (
            <ProgramFormDrawerContent
              drawerMode={drawerMode}
              form={form}
              formErrors={formErrors}
              sessionsForm={sessionsForm}
              exercisesList={exercisesList}
              loadingExercises={loadingExercises}
              submitting={submitting}
              expandedSessionIdx={expandedSessionIdx}
              onFormChange={handleFormChange}
              onAddSession={addSession}
              onRemoveSession={removeSession}
              onUpdateSession={updateSession}
              onAddExercise={addExercise}
              onRemoveExercise={removeExercise}
              onUpdateExercise={updateExercise}
              onExpandedChange={setExpandedSessionIdx}
            />
          )}
        </Drawer>

        <AssignProgramDrawer
          open={assignDrawerOpen}
          assignProgram={assignProgram}
          assignForm={assignForm}
          assignErrors={assignErrors}
          submitting={assignSubmitting}
          lookedUpUser={lookedUpUser}
          isLookingUpUser={isLookingUpUser}
          programDetail={assignProgramDetail}
          loadingDetail={loadingAssignDetail}
          selfAssign={assignForSelf}
          onClose={closeAssignDrawer}
          onChangeAssignForm={handleAssignFormChange}
          onSubmit={handleAssignSubmit}
          onCloneAndAssign={handleCloneAndAssign}
        />

        {confirmDeleteId && confirmDeleteId !== selectedId && (
          <ProgramDeleteConfirm
            confirmDeleteId={confirmDeleteId}
            submitting={submitting}
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={handleDelete}
          />
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
}

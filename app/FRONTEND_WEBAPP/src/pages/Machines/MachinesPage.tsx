import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  AlertCircle,
  Weight,
  Wrench,
  CheckCircle2,
  Layers,
  MapPin,
  Building2,
  Package,
  Info,
  ChevronDown,
  Component,
} from "lucide-react";
import {
  PageLoader,
  Pagination,
  Button,
  Drawer,
  Field,
  Input,
  Select,
  ToastContainer,
  useToasts,
  SectionTitle,
} from "../../components/ui";
import { cn } from "../../utils/cn";
import { machinesApi } from "../../services/MachinesAPI";
import { equipmentApi } from "../../services/EquipmentAPI";
import { floorplanApi } from "../../services/FloorplanAPI";
import type {
  Machine,
  Equipment,
  EquipmentType,
} from "../../types/equipment.types";
import type { MachineStatus } from "../../types/common.types";
import type { Floorplan } from "../../types/floorplan.types";
import { ImageUploader } from "../../components/ImageUploader";
import type { ImageUploadResult } from "../../components/ImageUploader";

// ==================== TYPES ====================

type SortKey = "updatedDesc" | "labelAsc" | "equipmentAsc";
type DrawerMode = "VIEW" | "CREATE" | "EDIT";
type EquipmentDrawerMode = "VIEW" | "CREATE" | "EDIT";

interface MachineDisplay {
  id: number;
  label: string;
  equipmentId: number;
  equipmentName: string | null;
  equipmentType: EquipmentType | null;
  equipmentImageUrl: string | null;
  floorplanId: number;
  floorplanName: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  status: MachineStatus;
  createdAt: string;
  updatedAt: string;
}

interface MachineFormData {
  floorplan_id: number;
  equipment_id: number | null;
  label: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
}

interface EquipmentFormData {
  equipment_name: string;
  equipment_type: EquipmentType | "";
  description: string;
  status: MachineStatus;
  image_key: string | null;
}

// ==================== DESIGN TOKENS ====================
// [FIX system] Typography scale — unified, no more ad-hoc mixing
// Page title:    text-2xl font-semibold
// Section title: text-base font-semibold
// Card title:    text-sm font-semibold
// Body:          text-sm
// Meta:          text-xs text-gray-400

// [FIX system] Lime discipline:
// ONLY for: primary CTA buttons, ACTIVE status dot
// NOT for: hover borders, active nav, badges, card accents

// [FIX system] Border XOR shadow — never both together
// Cards: border only, no shadow
// Modals/Drawers: shadow only

// ==================== UTILS ====================

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status: MachineStatus): string {
  return status === "ACTIVE" ? "ใช้งานได้" : "กำลังซ่อมบำรุง";
}

function getEquipmentTypeLabel(type: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    machine: "Machine",
    free_weight: "Free Weight",
    bodyweight: "Bodyweight",
    cable: "Cable",
    facility: "Facility",
    area: "Area",
  };
  return labels[type] || type;
}

function getEquipmentImageUrl(equipment: Equipment | undefined): string | null {
  if (!equipment) return null;
  const url = equipment.image_full_url || equipment.image_url;
  if (!url || url.includes("machineImageHolder") || url.includes("exerciseImageHolder")) return null;

  if (equipment.image_full_url) {
    if (equipment.image_full_url.startsWith("/")) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "";
      return `${serverUrl.replace(/\/$/, "")}${equipment.image_full_url}`;
    }
    return equipment.image_full_url;
  }
  if (equipment.image_url) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";
    return `${serverUrl.replace(/\/$/, "")}/api/v1/media/${equipment.image_url}`;
  }
  return null;
}

function mapToDisplay(
  machine: Machine,
  equipmentMap: Map<number, Equipment>,
  floorplanMap: Map<number, Floorplan>,
): MachineDisplay {
  const equipment = equipmentMap.get(machine.equipment_id);
  const floorplan = floorplanMap.get(machine.floorplan_id);
  return {
    id: machine.id,
    label: machine.label,
    equipmentId: machine.equipment_id,
    equipmentName: equipment?.equipment_name || null,
    equipmentType: equipment?.equipment_type || null,
    equipmentImageUrl: getEquipmentImageUrl(equipment),
    floorplanId: machine.floorplan_id,
    floorplanName: floorplan?.name || null,
    positionX: machine.position_x,
    positionY: machine.position_y,
    width: machine.width,
    height: machine.height,
    rotation: machine.rotation,
    status: machine.status,
    createdAt: machine.created_at,
    updatedAt: machine.updated_at,
  };
}

// ==================== EQUIPMENT CARD ====================
// [FIX #4] Card: rounded-xl, border only (no shadow), subtle hover
// [FIX #4.2] Hierarchy: title > subtitle > meta — weight steps are clear

interface EquipmentCardProps {
  imageUrl: string | null;
  name: string;
  description?: string | null;
  status: MachineStatus;
  floorplanName?: string | null;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

function EquipmentCard({
  imageUrl,
  name,
  description,
  status,
  floorplanName,
  positionX,
  positionY,
  width,
  height,
  onClick,
  onEdit,
  onDelete,
}: EquipmentCardProps) {
  const isActive = status === "ACTIVE";
  return (
    <div
      onClick={onClick}
      className="group relative flex gap-5 p-5 rounded-[2rem] border border-gray-200 bg-white hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5 transition-all cursor-pointer"
    >
      {/* Image */}
      <div className="relative shrink-0">
        <div className="w-32 h-32 rounded-3xl border border-gray-100 bg-gray-100/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-gray-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Component className="w-12 h-12 text-gray-200" strokeWidth={1} />
          )}
        </div>
        {/* [FIX lime] status dot — lime only for ACTIVE (positive), amber for maintenance */}
        <span
          className={cn(
            "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm",
            isActive ? "bg-lime-500" : "bg-amber-400",
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            {/* Larger card title */}
            <h3 className="text-base font-bold text-gray-900 truncate leading-tight">
              {name}
            </h3>
            {!isActive && (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600 uppercase">
                ซ่อม
              </span>
            )}
          </div>
          {/* Larger subtitle */}
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* [FIX #4.2] Meta = text-xs text-gray-400, icon opacity 60% */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {floorplanName && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Building2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate max-w-[100px]">{floorplanName}</span>
            </span>
          )}
          {positionX !== undefined && positionY !== undefined && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-60" />
              {positionX},{positionY}
            </span>
          )}
          {width !== undefined && height !== undefined && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 shrink-0 opacity-60" />
              {width}×{height}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          {onEdit && (
            <button
              onClick={onEdit}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
              aria-label="แก้ไข"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 transition-all"
              aria-label="ลบ"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function MachinesPage() {
  const [machines, setMachines] = useState<MachineDisplay[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "ALL">(
    "ALL",
  );
  const [floorplanFilter, setFloorplanFilter] = useState<number | "ALL">("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState<number | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("updatedDesc");

  const [machinePage, setMachinePage] = useState(1);
  const MACHINE_PAGE_SIZE = 10;
  const [equipmentPage, setEquipmentPage] = useState(1);
  const EQUIPMENT_PAGE_SIZE = 10;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("VIEW");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  const emptyForm: MachineFormData = {
    floorplan_id: 1,
    equipment_id: null,
    label: "",
    position_x: 1,
    position_y: 1,
    width: 100,
    height: 80,
    rotation: 0,
  };
  const [form, setForm] = useState<MachineFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof MachineFormData, string>> & { _general?: string }
  >({});
  const [submitting, setSubmitting] = useState(false);

  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [equipmentDrawerMode, setEquipmentDrawerMode] =
    useState<EquipmentDrawerMode>("VIEW");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null,
  );
  const [confirmDeleteEquipmentId, setConfirmDeleteEquipmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    setEnlargedImageUrl(null);
  }, [selectedId, selectedEquipmentId]);
  const [equipmentListDrawerOpen, setEquipmentListDrawerOpen] = useState(false);
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState("");

  const emptyEquipmentForm: EquipmentFormData = {
    equipment_name: "",
    equipment_type: "machine",
    description: "",
    status: "ACTIVE",
    image_key: null,
  };
  const [equipmentForm, setEquipmentForm] =
    useState<EquipmentFormData>(emptyEquipmentForm);
  const [equipmentFormErrors, setEquipmentFormErrors] = useState<
    Partial<Record<keyof EquipmentFormData, string>> & { _general?: string }
  >({});
  const [equipmentSubmitting, setEquipmentSubmitting] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();

  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allMachines: Machine[] = [];
      const equipmentMap = new Map<number, Equipment>();
      const floorplanMap = new Map<number, Floorplan>();
      const equipmentResponse = await equipmentApi.getAll();
      equipmentResponse.equipment.forEach((eq) => equipmentMap.set(eq.id, eq));
      try {
        const activeFloorplan = await floorplanApi.getById(1);
        floorplanMap.set(activeFloorplan.id, activeFloorplan);
        const floorplanMachines = await machinesApi.getByFloorplanId(
          activeFloorplan.id,
        );
        allMachines.push(...floorplanMachines);
      } catch {
        try {
          const floorplan = await floorplanApi.getById(1);
          floorplanMap.set(floorplan.id, floorplan);
          const floorplanMachines = await machinesApi.getByFloorplanId(
            floorplan.id,
          );
          allMachines.push(...floorplanMachines);
        } catch {
          /* not found */
        }
      }
      setMachines(
        allMachines.map((m) => mapToDisplay(m, equipmentMap, floorplanMap)),
      );
      setFloorplans(Array.from(floorplanMap.values()));
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "ไม่สามารถโหลดข้อมูลได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEquipment = useCallback(async () => {
    try {
      const response = await equipmentApi.getAll();
      setEquipmentList(response.equipment || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadMachines();
    loadEquipment();
  }, [loadMachines, loadEquipment]);

  const filteredMachines = useMemo(() => {
    let result = [...machines];
    const query = (searchQuery || "").trim().toLowerCase();
    if (query) {
      result = result.filter(
        (m) =>
          m.label.toLowerCase().includes(query) ||
          m.equipmentName?.toLowerCase().includes(query) ||
          m.equipmentType?.toLowerCase().includes(query) ||
          m.floorplanName?.toLowerCase().includes(query),
      );
    }
    if (statusFilter !== "ALL")
      result = result.filter((m) => m.status === statusFilter);
    if (floorplanFilter !== "ALL")
      result = result.filter((m) => m.floorplanId === floorplanFilter);
    if (equipmentFilter !== "ALL")
      result = result.filter((m) => m.equipmentId === equipmentFilter);
    result.sort((a, b) => {
      if (sortKey === "labelAsc") return a.label.localeCompare(b.label);
      if (sortKey === "equipmentAsc")
        return (a.equipmentName || "").localeCompare(b.equipmentName || "");
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [
    machines,
    searchQuery,
    statusFilter,
    floorplanFilter,
    equipmentFilter,
    sortKey,
  ]);

  const paginatedMachines = useMemo(() => {
    const start = (machinePage - 1) * MACHINE_PAGE_SIZE;
    return filteredMachines.slice(start, start + MACHINE_PAGE_SIZE);
  }, [filteredMachines, machinePage]);

  const machineTotalPages = Math.ceil(
    filteredMachines.length / MACHINE_PAGE_SIZE,
  );

  useEffect(() => {
    setMachinePage(1);
  }, [searchQuery, statusFilter, floorplanFilter, equipmentFilter, sortKey]);

  const filteredEquipmentList = useMemo(() => {
    let result = [...equipmentList];
    const query = (equipmentSearchQuery || "").trim().toLowerCase();
    if (query) {
      result = result.filter(
        (eq) =>
          eq.equipment_name.toLowerCase().includes(query) ||
          eq.equipment_type.toLowerCase().includes(query) ||
          eq.description?.toLowerCase().includes(query),
      );
    }
    return result.sort((a, b) =>
      a.equipment_name.localeCompare(b.equipment_name),
    );
  }, [equipmentList, equipmentSearchQuery]);

  const paginatedEquipment = useMemo(() => {
    const start = (equipmentPage - 1) * EQUIPMENT_PAGE_SIZE;
    return filteredEquipmentList.slice(start, start + EQUIPMENT_PAGE_SIZE);
  }, [filteredEquipmentList, equipmentPage]);

  const equipmentTotalPages = Math.ceil(
    filteredEquipmentList.length / EQUIPMENT_PAGE_SIZE,
  );
  useEffect(() => {
    setEquipmentPage(1);
  }, [equipmentSearchQuery]);

  const selectedMachine = useMemo(
    () => machines.find((m) => m.id === selectedId) || null,
    [machines, selectedId],
  );
  const selectedEquipment = useMemo(() => {
    if (!selectedMachine) return null;
    return (
      equipmentList.find((e) => e.id === selectedMachine.equipmentId) || null
    );
  }, [selectedMachine, equipmentList]);

  const openView = useCallback((id: number) => {
    setDrawerMode("VIEW");
    setSelectedId(id);
    setFormErrors({});
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback(
    (id: number) => {
      const machine = machines.find((m) => m.id === id);
      if (!machine) return;
      setForm({
        floorplan_id: machine.floorplanId,
        equipment_id: machine.equipmentId,
        label: machine.label,
        position_x: machine.positionX,
        position_y: machine.positionY,
        width: machine.width,
        height: machine.height,
        rotation: machine.rotation,
      });
      setFormErrors({});
      setDrawerMode("EDIT");
      setSelectedId(id);
      setDrawerOpen(true);
    },
    [machines],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setFormErrors({});
    setConfirmDeleteId(null);
    setSelectedId(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof MachineFormData, string>> & {
      _general?: string;
    } = {};
    if (!(form.label || "").trim()) errors.label = "กรุณากรอกชื่อเครื่อง";
    else if ((form.label || "").trim().length < 2)
      errors.label = "ชื่อเครื่องต้องมีอย่างน้อย 2 ตัวอักษร";
    if (!form.equipment_id) errors.equipment_id = "กรุณาเลือก Equipment";
    if (form.width <= 0 || form.height <= 0) errors.width = "ขนาดต้องมากกว่า 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      if (drawerMode === "CREATE") {
        await machinesApi.create({
          floorplan_id: form.floorplan_id,
          equipment_id: form.equipment_id!,
          label: (form.label || "").trim(),
          position_x: form.position_x,
          position_y: form.position_y,
          width: form.width,
          height: form.height,
          rotation: form.rotation || 0,
        });
      } else if (drawerMode === "EDIT" && selectedId) {
        await machinesApi.update(selectedId, {
          label: (form.label || "").trim(),
          position_x: form.position_x,
          position_y: form.position_y,
          width: form.width,
          height: form.height,
          rotation: form.rotation || 0,
        });
      }
      await loadMachines();
      addToast(
        "success",
        drawerMode === "CREATE"
          ? "สร้างเครื่องใหม่สำเร็จ"
          : "บันทึกการแก้ไขแล้ว",
      );
      closeDrawer();
    } catch (err: any) {
      setFormErrors({
        _general:
          err?.response?.data?.error || err?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setSubmitting(false);
    }
  }, [form, drawerMode, selectedId, validateForm, loadMachines, closeDrawer]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirmDeleteId !== id) {
        setConfirmDeleteId(id);
        return;
      }
      try {
        setSubmitting(true);
        await machinesApi.delete(id);
        await loadMachines();
        if (selectedId === id) closeDrawer();
        setConfirmDeleteId(null);
        addToast("success", "ลบเครื่องสำเร็จ");
      } catch (err: any) {
        alert(err?.response?.data?.error || err?.message || "ไม่สามารถลบได้");
      } finally {
        setSubmitting(false);
      }
    },
    [confirmDeleteId, selectedId, loadMachines, closeDrawer],
  );

  const handleStatusUpdate = useCallback(
    async (id: number, status: MachineStatus) => {
      try {
        await machinesApi.updateStatus(id, status);
        await loadMachines();
        addToast("success", "อัปเดตสถานะแล้ว");
      } catch (err: any) {
        alert(err?.response?.data?.error || err?.message || "อัปเดตไม่สำเร็จ");
      }
    },
    [loadMachines],
  );

  const openEquipmentCreate = useCallback(() => {
    setEquipmentForm(emptyEquipmentForm);
    setEquipmentFormErrors({});
    setEquipmentDrawerMode("CREATE");
    setSelectedEquipmentId(null);
    setEquipmentDrawerOpen(true);
  }, [emptyEquipmentForm]);

  const openEquipmentView = useCallback((id: number) => {
    setEquipmentDrawerMode("VIEW");
    setSelectedEquipmentId(id);
    setEquipmentFormErrors({});
    setEquipmentDrawerOpen(true);
  }, []);

  const openEquipmentEdit = useCallback(
    (id: number) => {
      const equipment = equipmentList.find((e) => e.id === id);
      if (!equipment) return;
      let imageKey: string | null = null;
      if (equipment.image_full_url) {
        const match = equipment.image_full_url.match(/\/api\/v1\/media\/(.+)$/);
        if (match) imageKey = match[1];
      } else if (equipment.image_url) {
        imageKey = equipment.image_url;
      }
      setEquipmentForm({
        equipment_name: equipment.equipment_name,
        equipment_type: equipment.equipment_type,
        description: equipment.description || "",
        status: equipment.status,
        image_key: imageKey,
      });
      setEquipmentFormErrors({});
      setEquipmentDrawerMode("EDIT");
      setSelectedEquipmentId(id);
      setEquipmentDrawerOpen(true);
    },
    [equipmentList],
  );

  const closeEquipmentDrawer = useCallback(() => {
    setEquipmentDrawerOpen(false);
    setEquipmentFormErrors({});
    setConfirmDeleteEquipmentId(null);
    setSelectedEquipmentId(null);
  }, []);

  const openEquipmentUpdate = useCallback(() => {
    setEquipmentSearchQuery("");
    setEquipmentPage(1);
    setEquipmentListDrawerOpen(true);
  }, []);

  const closeEquipmentListDrawer = useCallback(() => {
    setEquipmentListDrawerOpen(false);
    setEquipmentSearchQuery("");
    setEquipmentPage(1);
  }, []);

  const validateEquipmentForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof EquipmentFormData, string>> & {
      _general?: string;
    } = {};
    if (!(equipmentForm.equipment_name || "").trim()) {
      errors.equipment_name = "กรุณากรอกชื่อ Equipment";
    } else if ((equipmentForm.equipment_name || "").trim().length < 2) {
      errors.equipment_name = "ชื่อ Equipment ต้องมีอย่างน้อย 2 ตัวอักษร";
    } else {
      const trimmedName = (equipmentForm.equipment_name || "").trim().toLowerCase();
      const duplicate = equipmentList.find(
        (eq) =>
          eq.id !== selectedEquipmentId &&
          eq.equipment_name.toLowerCase() === trimmedName,
      );
      if (duplicate) errors.equipment_name = "ชื่อนี้มีอยู่แล้ว";
    }
    setEquipmentFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [equipmentForm, equipmentList, selectedEquipmentId]);

  const handleEquipmentSubmit = useCallback(async () => {
    if (!validateEquipmentForm()) return;
    setEquipmentSubmitting(true);
    setEquipmentFormErrors({});
    try {
      const payload: any = {
        equipment_name: (equipmentForm.equipment_name || "").trim(),
        equipment_type: equipmentForm.equipment_type || null,
        description: (equipmentForm.description || "").trim() || undefined,
        status: equipmentForm.status,
        image_url: equipmentForm.image_key,
      };
      if (equipmentDrawerMode === "CREATE") await equipmentApi.create(payload);
      else if (equipmentDrawerMode === "EDIT" && selectedEquipmentId)
        await equipmentApi.update(selectedEquipmentId, payload);
      await loadEquipment();
      await loadMachines();
      addToast(
        "success",
        equipmentDrawerMode === "CREATE"
          ? "สร้าง Equipment สำเร็จ"
          : "บันทึกการแก้ไขแล้ว",
      );
      closeEquipmentDrawer();
    } catch (err: any) {
      setEquipmentFormErrors({
        _general:
          err?.response?.data?.error || err?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setEquipmentSubmitting(false);
    }
  }, [
    equipmentForm,
    equipmentDrawerMode,
    selectedEquipmentId,
    validateEquipmentForm,
    loadEquipment,
    loadMachines,
    closeEquipmentDrawer,
  ]);

  const handleEquipmentDelete = useCallback(
    async (id: number) => {
      if (confirmDeleteEquipmentId !== id) {
        setConfirmDeleteEquipmentId(id);
        return;
      }
      try {
        setEquipmentSubmitting(true);
        await equipmentApi.delete(id);
        await loadEquipment();
        await loadMachines();
        if (selectedEquipmentId === id) closeEquipmentDrawer();
        setConfirmDeleteEquipmentId(null);
        addToast("success", "ลบ Equipment สำเร็จ");
      } catch (err: any) {
        alert(err?.response?.data?.error || err?.message || "ไม่สามารถลบได้");
      } finally {
        setEquipmentSubmitting(false);
      }
    },
    [
      confirmDeleteEquipmentId,
      selectedEquipmentId,
      loadEquipment,
      loadMachines,
      closeEquipmentDrawer,
      addToast,
    ],
  );

  const selectedEquipmentForDrawer = useMemo(() => {
    if (equipmentDrawerOpen && selectedEquipmentId) {
      return equipmentList.find((e) => e.id === selectedEquipmentId) || null;
    }
    return null;
  }, [equipmentList, selectedEquipmentId, equipmentDrawerOpen]);

  const isFiltered =
    statusFilter !== "ALL" ||
    floorplanFilter !== "ALL" ||
    equipmentFilter !== "ALL" ||
    !!searchQuery;

  if (loading) return <PageLoader message="กำลังโหลดข้อมูล..." />;

  if (error && machines.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            ไม่สามารถโหลดข้อมูลได้
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={loadMachines}
            className="h-10 px-6 rounded-xl bg-lime-500 hover:bg-lime-600 text-white text-sm font-semibold transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/40">
      {/* [FIX #5] max-w-6xl, px-6 py-8, gap consistent */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* ─── Page Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6">
          <div>
            {/* [FIX #1] overline → text-xs  text-gray-400 */}
            <p className="text-xs font-semibold  text-gray-400 uppercase mb-1">
              GYMMATE
            </p>
            {/* [FIX #1] title → text-2xl font-semibold */}
            <h1 className="text-2xl font-semibold text-gray-900">
              เครื่องออกกำลังกาย
            </h1>
            {/* [FIX #1] subtitle → text-sm text-gray-500 — readable not ghost */}
            <p className="text-sm text-gray-500 mt-0.5">
              {machines.length} instances · {equipmentList.length} equipment
            </p>
          </div>

          {/* [FIX #2] Action buttons — balanced sizing, shadow only on primary */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openEquipmentUpdate}
              className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              จัดการ
            </button>
            {/* [FIX #2] Primary CTA: lime-600 + shadow-lime only here */}
            <button
              onClick={openEquipmentCreate}
              className="h-10 px-4 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold shadow-md shadow-lime-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              เพิ่ม
            </button>
          </div>
        </div>

        {/* ─── Error Banner ──────────────────────────────────────────── */}
        {error && machines.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-amber-400 hover:text-amber-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ─── Search & Filters ──────────────────────────────────────── */}
        {/* [FIX #3] h-9 controls, rounded-lg, no shadow, border-gray-200 */}
        <div className="space-y-2">
          {/* Row 1: Search 60% + Status toggle 40% */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหาเครื่อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8.5 pr-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status segmented control */}
            <div className="flex items-center p-0.5 rounded-lg bg-gray-100 gap-0.5 shrink-0">
              {(["ALL", "ACTIVE", "MAINTENANCE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                    statusFilter === s
                      ? s === "ACTIVE"
                        ? "bg-lime-500 text-white"
                        : s === "MAINTENANCE"
                          ? "bg-amber-500 text-white"
                          : "bg-white text-gray-900"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {s === "ALL" ? "ทั้งหมด" : s === "ACTIVE" ? "ปกติ" : "ซ่อม"}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Floorplan + Equipment + Sort + count/clear */}
          <div className="flex items-center gap-2">
            {/* [FIX #3] Dropdown: h-9, rounded-lg, no shadow */}
            {[
              {
                value: floorplanFilter,
                onChange: (v: string) =>
                  setFloorplanFilter(v === "ALL" ? "ALL" : Number(v)),
                defaultLabel: "Floorplan: ทั้งหมด",
                options: floorplans.map((fp) => ({
                  value: fp.id,
                  label: fp.name,
                })),
              },
              {
                value: equipmentFilter,
                onChange: (v: string) =>
                  setEquipmentFilter(v === "ALL" ? "ALL" : Number(v)),
                defaultLabel: "Equipment: ทั้งหมด",
                options: equipmentList.map((eq) => ({
                  value: eq.id,
                  label: eq.equipment_name,
                })),
              },
            ].map((dd, i) => (
              <div key={i} className="relative flex-1 min-w-0">
                <select
                  value={dd.value}
                  onChange={(e) => dd.onChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-6 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none transition-colors"
                >
                  <option value="ALL">{dd.defaultLabel}</option>
                  {dd.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              </div>
            ))}

            <div className="relative shrink-0">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-9 pl-3 pr-6 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none transition-colors"
              >
                <option value="updatedDesc">ล่าสุด</option>
                <option value="labelAsc">ชื่อ A-Z</option>
                <option value="equipmentAsc">Equipment</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            {isFiltered ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setFloorplanFilter("ALL");
                  setEquipmentFilter("ALL");
                }}
                className="h-9 w-9 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors shrink-0 flex items-center justify-center"
                title="เคลียร์"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="text-xs text-gray-400 shrink-0 w-9 text-center tabular-nums">
                {filteredMachines.length}
              </span>
            )}
          </div>
        </div>

        {/* ─── Machine List ─────────────────────────────────────────── */}
        {filteredMachines.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center px-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
              <Weight className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isFiltered ? "ไม่พบเครื่องที่ตรงกัน" : "ยังไม่มีเครื่อง"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {isFiltered
                ? "ลองปรับตัวกรองหรือคำค้นหา"
                : "เริ่มต้นด้วยการเพิ่ม Equipment แล้วสร้างเครื่อง"}
            </p>
            {isFiltered ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setFloorplanFilter("ALL");
                  setEquipmentFilter("ALL");
                }}
                className="h-9 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                เคลียร์ตัวกรอง
              </button>
            ) : (
              <button
                onClick={openEquipmentCreate}
                className="h-10 px-5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold shadow-md shadow-lime-500/20 transition-all"
              >
                เพิ่ม Equipment แรก
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedMachines.map((machine) => (
                <EquipmentCard
                  key={machine.id}
                  imageUrl={machine.equipmentImageUrl}
                  name={machine.label}
                  description={
                    machine.equipmentName
                      ? machine.equipmentType
                        ? `${machine.equipmentName} · ${getEquipmentTypeLabel(machine.equipmentType)}`
                        : machine.equipmentName
                      : null
                  }
                  status={machine.status}
                  floorplanName={machine.floorplanName}
                  positionX={machine.positionX}
                  positionY={machine.positionY}
                  width={machine.width}
                  height={machine.height}
                  onClick={() => openView(machine.id)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    openEdit(machine.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDelete(machine.id);
                  }}
                />
              ))}
            </div>

            {/* [FIX #6] Pagination spacing — mt-4 not pt-2 */}
            {machineTotalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={machinePage}
                  totalPages={machineTotalPages}
                  onPageChange={setMachinePage}
                  totalItems={filteredMachines.length}
                  pageSize={MACHINE_PAGE_SIZE}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Machine Drawer ────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        title={
          drawerMode === "CREATE"
            ? "เพิ่มเครื่องใหม่"
            : drawerMode === "EDIT"
              ? "แก้ไขเครื่อง"
              : selectedMachine?.label || "รายละเอียดเครื่อง"
        }
        subtitle={
          drawerMode === "VIEW"
            ? "ดูรายละเอียดเครื่อง"
            : drawerMode === "CREATE"
              ? "เพิ่มเครื่องใหม่ใน floorplan"
              : "แก้ไขข้อมูลเครื่อง"
        }
        onClose={closeDrawer}
        footer={
          drawerMode === "VIEW" ? (
            selectedMachine ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-400 truncate">
                  อัปเดต {formatDate(selectedMachine.updatedAt)}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedMachine.id,
                        selectedMachine.status === "ACTIVE"
                          ? "MAINTENANCE"
                          : "ACTIVE",
                      )
                    }
                    className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  >
                    {selectedMachine.status === "ACTIVE" ? (
                      <>
                        <Wrench className="h-3 w-3" />
                        ซ่อม
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        ใช้งาน
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(selectedMachine.id)}
                    className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMachine.id)}
                    disabled={submitting}
                    className="h-8 px-3 rounded-lg border border-rose-100 bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" />
                    {confirmDeleteId === selectedMachine.id ? "ยืนยัน" : "ลบ"}
                  </button>
                </div>
              </div>
            ) : (
              <div />
            )
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={closeDrawer}
                disabled={submitting}
                className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-9 px-5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {submitting && (
                  <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {drawerMode === "CREATE" ? "สร้างเครื่อง" : "บันทึก"}
              </button>
            </div>
          )
        }
      >
        {drawerMode === "VIEW" ? (
          selectedMachine ? (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-20 h-20 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                  <img
                    src={
                      selectedMachine.equipmentImageUrl ||
                      "/machineImageHolder.png"
                    }
                    alt={selectedMachine.equipmentName || selectedMachine.label}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.src = "/machineImageHolder.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 h-5 px-2 rounded-md text-xs font-semibold mb-1.5",
                      selectedMachine.status === "ACTIVE"
                        ? "bg-lime-50 border border-lime-100 text-lime-700"
                        : "bg-amber-50 border border-amber-100 text-amber-700",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        selectedMachine.status === "ACTIVE"
                          ? "bg-lime-500"
                          : "bg-amber-400",
                      )}
                    />
                    {getStatusLabel(selectedMachine.status)}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    {selectedMachine.label}
                  </h3>
                  {selectedMachine.equipmentName && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedMachine.equipmentName}
                      {selectedMachine.equipmentType && (
                        <>
                          {" "}
                          ·{" "}
                          {getEquipmentTypeLabel(selectedMachine.equipmentType)}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Hero Image Section */}
              {selectedMachine.equipmentImageUrl ? (
                <div className="relative h-64 w-full -mx-8 -mt-6 mb-6 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 group/hero cursor-zoom-in" onClick={() => setEnlargedImageUrl(selectedMachine.equipmentImageUrl)}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <img
                    src={selectedMachine.equipmentImageUrl}
                    alt={selectedMachine.equipmentName || selectedMachine.label}
                    className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover/hero:scale-110 drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = "/machineImageHolder.png";
                    }}
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover/hero:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-sm text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    คลิกเพื่อขยาย
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full -mx-8 -mt-6 mb-6 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <Component className="w-16 h-16 text-gray-200" strokeWidth={1} />
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-3 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  รายละเอียด
                </p>
                {[
                  { label: "Equipment ID", value: selectedMachine.equipmentId },
                  {
                    label: "Floorplan",
                    value:
                      selectedMachine.floorplanName ||
                      selectedMachine.floorplanId,
                  },
                  { label: "Status Type", value: selectedMachine.equipmentType ? getEquipmentTypeLabel(selectedMachine.equipmentType) : "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                    <span className="text-xs font-bold text-gray-900 bg-white px-2 py-1 rounded-lg border border-gray-200">
                      {value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              {selectedEquipment?.description && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    คำอธิบาย
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{selectedEquipment.description}"
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  ตำแหน่ง & ขนาด
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "X (M)", value: (selectedMachine.positionX / 100).toFixed(1) },
                    { label: "Y (M)", value: (selectedMachine.positionY / 100).toFixed(1) },
                    {
                      label: "Rotation",
                      value: `${selectedMachine.rotation}°`,
                    },
                    { label: "Width (M)", value: (selectedMachine.width / 100).toFixed(2) },
                    { label: "Height (M)", value: (selectedMachine.height / 100).toFixed(2) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center text-center">
              <Weight className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">ไม่พบข้อมูลเครื่อง</p>
            </div>
          )
        ) : (
          <div className="space-y-5">
            {formErrors._general && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <p className="text-xs font-medium text-rose-700">
                  {formErrors._general}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2.5">
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                Equipment คือ catalog ที่ Machine อ้างอิง — จัดการได้ที่ปุ่ม{" "}
                <span className="font-semibold text-gray-700">"จัดการ"</span>
              </p>
            </div>

            <Field
              label="Equipment"
              hint={
                drawerMode === "EDIT"
                  ? "ไม่สามารถเปลี่ยน Equipment ได้"
                  : "Required"
              }
              required={drawerMode === "CREATE"}
              error={formErrors.equipment_id}
            >
              <div className="flex gap-2">
                <Select
                  value={form.equipment_id || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      equipment_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  disabled={submitting || drawerMode === "EDIT"}
                  className="flex-1"
                >
                  <option value="">เลือก Equipment</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipment_name} (
                      {getEquipmentTypeLabel(eq.equipment_type)})
                    </option>
                  ))}
                </Select>
                {drawerMode === "CREATE" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openEquipmentCreate}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Field>

            {drawerMode === "EDIT" && selectedEquipment && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                <div className="shrink-0 w-10 h-10 rounded-lg border border-gray-100 bg-white overflow-hidden">
                  <img
                    src={
                      selectedMachine?.equipmentImageUrl ||
                      "/machineImageHolder.png"
                    }
                    alt={selectedEquipment.equipment_name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.src = "/machineImageHolder.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Equipment ที่ใช้
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {selectedEquipment.equipment_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getEquipmentTypeLabel(selectedEquipment.equipment_type)}
                  </p>
                </div>
              </div>
            )}

            <Field
              label="ชื่อเครื่อง"
              hint="Required"
              required
              error={formErrors.label}
            >
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="เช่น Bench Press Station 1"
                disabled={submitting}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Position X">
                <Input
                  type="number"
                  step="0.1"
                  value={form.position_x}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      position_x: Number(e.target.value),
                    }))
                  }
                  disabled={submitting}
                />
              </Field>
              <Field label="Position Y">
                <Input
                  type="number"
                  step="0.1"
                  value={form.position_y}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      position_y: Number(e.target.value),
                    }))
                  }
                  disabled={submitting}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Width" error={formErrors.width}>
                <Input
                  type="number"
                  value={form.width}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, width: Number(e.target.value) }))
                  }
                  disabled={submitting}
                />
              </Field>
              <Field label="Height" error={formErrors.width}>
                <Input
                  type="number"
                  value={form.height}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, height: Number(e.target.value) }))
                  }
                  disabled={submitting}
                />
              </Field>
            </div>
            <Field label="Rotation" hint="องศา (0-360)">
              <Input
                type="number"
                min="0"
                max="360"
                value={form.rotation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rotation: Number(e.target.value) }))
                }
                disabled={submitting}
              />
            </Field>

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                สำหรับวางตำแหน่งที่แม่นยำ ใช้{" "}
                <span className="font-semibold text-gray-700">
                  Floorplan Editor
                </span>
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation */}
      {confirmDeleteId && confirmDeleteId !== selectedId && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(400px,90vw)] rounded-xl border border-rose-200 bg-white p-5 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 shrink-0 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                ยืนยันการลบ
              </p>
              <p className="text-sm text-gray-500">
                ต้องการลบ Machine instance นี้? Equipment จะไม่ถูกลบ
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDeleteId(null)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(confirmDeleteId)}
              disabled={submitting}
              loading={submitting}
            >
              ลบเครื่อง
            </Button>
          </div>
        </div>
      )}

      {/* Equipment Drawer */}
      <Drawer
        open={equipmentDrawerOpen}
        title={
          equipmentDrawerMode === "CREATE"
            ? "เพิ่ม Equipment ใหม่"
            : equipmentDrawerMode === "EDIT"
              ? "แก้ไข Equipment"
              : selectedEquipmentForDrawer?.equipment_name ||
              "รายละเอียด Equipment"
        }
        subtitle={
          equipmentDrawerMode === "VIEW"
            ? "ดูรายละเอียด Equipment"
            : equipmentDrawerMode === "CREATE"
              ? "เพิ่ม Equipment ใหม่ใน catalog"
              : "แก้ไขข้อมูล Equipment"
        }
        onClose={closeEquipmentDrawer}
        footer={
          equipmentDrawerMode === "VIEW" ? (
            selectedEquipmentForDrawer ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-400 truncate">
                  อัปเดต {formatDate(selectedEquipmentForDrawer.updated_at)}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      openEquipmentEdit(selectedEquipmentForDrawer.id)
                    }
                    className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() =>
                      handleEquipmentDelete(selectedEquipmentForDrawer.id)
                    }
                    disabled={equipmentSubmitting}
                    className="h-8 px-3 rounded-lg border border-rose-100 bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" />
                    {confirmDeleteEquipmentId === selectedEquipmentForDrawer.id
                      ? "ยืนยัน"
                      : "ลบ"}
                  </button>
                </div>
              </div>
            ) : (
              <div />
            )
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={closeEquipmentDrawer}
                disabled={equipmentSubmitting}
                className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEquipmentSubmit}
                disabled={equipmentSubmitting}
                className="h-9 px-5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {equipmentSubmitting && (
                  <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {equipmentDrawerMode === "CREATE"
                  ? "สร้าง Equipment"
                  : "บันทึก"}
              </button>
            </div>
          )
        }
      >
        {equipmentDrawerMode === "VIEW" ? (
          selectedEquipmentForDrawer ? (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-20 h-20 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                  <img
                    src={
                      getEquipmentImageUrl(selectedEquipmentForDrawer) ||
                      "/machineImageHolder.png"
                    }
                    alt={selectedEquipmentForDrawer.equipment_name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.src = "/machineImageHolder.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 h-5 px-2 rounded-md text-xs font-semibold mb-1.5",
                      selectedEquipmentForDrawer.status === "ACTIVE"
                        ? "bg-lime-50 border border-lime-100 text-lime-700"
                        : "bg-amber-50 border border-amber-100 text-amber-700",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        selectedEquipmentForDrawer.status === "ACTIVE"
                          ? "bg-lime-500"
                          : "bg-amber-400",
                      )}
                    />
                    {getStatusLabel(selectedEquipmentForDrawer.status)}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    {selectedEquipmentForDrawer.equipment_name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getEquipmentTypeLabel(
                      selectedEquipmentForDrawer.equipment_type,
                    )}
                  </p>
                </div>
              </div>

              {/* Hero Image Section */}
              {getEquipmentImageUrl(selectedEquipmentForDrawer) ? (
                <div className="relative h-64 w-full -mx-8 -mt-6 mb-6 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 group/hero cursor-zoom-in" onClick={() => setEnlargedImageUrl(getEquipmentImageUrl(selectedEquipmentForDrawer))}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <img
                    src={getEquipmentImageUrl(selectedEquipmentForDrawer) || ""}
                    alt={selectedEquipmentForDrawer.equipment_name}
                    className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover/hero:scale-110 drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = "/machineImageHolder.png";
                    }}
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover/hero:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-sm text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    คลิกเพื่อขยาย
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full -mx-8 -mt-6 mb-6 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <Component className="w-16 h-16 text-gray-200" strokeWidth={1} />
                </div>
              )}

              {selectedEquipmentForDrawer.description && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    คำอธิบาย
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{selectedEquipmentForDrawer.description}"
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <SectionTitle
                  icon={Weight}
                  title="Equipment ทั้งหมด"
                  desc={`${equipmentList.length} รายการ`}
                />
                <div className="space-y-1.5 max-h-56 overflow-y-auto mt-3">
                  {equipmentList.map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => openEquipmentView(eq.id)}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      {getEquipmentImageUrl(eq) ? (
                        <img
                          src={getEquipmentImageUrl(eq) || ""}
                          alt={eq.equipment_name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/machineImageHolder.png";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {eq.equipment_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getEquipmentTypeLabel(eq.equipment_type)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              ไม่พบข้อมูล Equipment
            </div>
          )
        ) : (
          <div className="space-y-5">
            {equipmentFormErrors._general && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">
                  {equipmentFormErrors._general}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2.5">
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                Equipment เป็น catalog สำหรับอ้างอิง — ชื่อห้ามซ้ำกัน
              </p>
            </div>

            <Field
              label="ชื่อ Equipment"
              hint="Required"
              required
              error={equipmentFormErrors.equipment_name}
            >
              <Input
                value={equipmentForm.equipment_name}
                onChange={(e) =>
                  setEquipmentForm((p) => ({
                    ...p,
                    equipment_name: e.target.value,
                  }))
                }
                placeholder="เช่น Cable Machine, Leg Press"
                disabled={equipmentSubmitting}
              />
            </Field>

            <Field
              label="ประเภท Equipment"
              required
              error={equipmentFormErrors.equipment_type}
            >
              <Select
                value={equipmentForm.equipment_type}
                onChange={(e) =>
                  setEquipmentForm((p) => ({
                    ...p,
                    equipment_type: e.target.value as EquipmentType | "",
                  }))
                }
                disabled={equipmentSubmitting}
              >
                <option value="machine">Machine</option>
                <option value="free_weight">Free Weight</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="cable">Cable</option>
                <option value="facility">Facility</option>
                <option value="area">Area</option>
              </Select>
            </Field>

            <Field label="คำอธิบาย" hint="Optional">
              <textarea
                value={equipmentForm.description}
                onChange={(e) =>
                  setEquipmentForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="อธิบายรายละเอียด Equipment..."
                disabled={equipmentSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </Field>

            <Field label="สถานะ" required>
              <Select
                value={equipmentForm.status}
                onChange={(e) =>
                  setEquipmentForm((p) => ({
                    ...p,
                    status: e.target.value as MachineStatus,
                  }))
                }
                disabled={equipmentSubmitting}
              >
                <option value="ACTIVE">ใช้งานได้</option>
                <option value="MAINTENANCE">กำลังซ่อมบำรุง</option>
              </Select>
            </Field>

            <Field label="รูป Equipment" hint="Optional · JPG, PNG (max 5MB)">
              <ImageUploader
                entityType="equipment"
                initialImageUrl={
                  equipmentDrawerMode === "EDIT" && selectedEquipmentForDrawer
                    ? getEquipmentImageUrl(selectedEquipmentForDrawer)
                    : equipmentForm.image_key
                      ? `${import.meta.env.VITE_SERVER_URL || ""}/api/v1/media/${equipmentForm.image_key}`
                      : null
                }
                onUploadComplete={(result: ImageUploadResult) =>
                  setEquipmentForm((p) => ({ ...p, image_key: result.key }))
                }
                onRemove={() =>
                  setEquipmentForm((p) => ({ ...p, image_key: null }))
                }
                disabled={equipmentSubmitting}
                placeholder="อัปโหลดรูป Equipment"
              />
            </Field>
          </div>
        )}
      </Drawer>

      {/* Equipment Delete Confirmation */}
      {confirmDeleteEquipmentId &&
        confirmDeleteEquipmentId !== selectedEquipmentId && (
          <div className="fixed bottom-6 right-6 z-50 w-[min(400px,90vw)] rounded-xl border border-rose-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 shrink-0 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  ยืนยันการลบ Equipment
                </p>
                <p className="text-sm text-gray-500">
                  ลบ Equipment นี้จะส่งผลต่อ Machines ที่ใช้ Equipment นี้
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDeleteEquipmentId(null)}
                disabled={equipmentSubmitting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleEquipmentDelete(confirmDeleteEquipmentId)}
                disabled={equipmentSubmitting}
                loading={equipmentSubmitting}
              >
                ลบ Equipment
              </Button>
            </div>
          </div>
        )}

      {/* Equipment List Drawer */}
      <Drawer
        open={equipmentListDrawerOpen}
        title="จัดการ Equipment"
        subtitle={`${filteredEquipmentList.length} รายการ`}
        onClose={closeEquipmentListDrawer}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="shrink-0 px-4 pt-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหา Equipment..."
                value={equipmentSearchQuery}
                onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="shrink-0 px-5 py-2 border-y border-gray-100 bg-gray-50/60">
            <p className="text-xs font-semibold text-gray-400 uppercase ">
              {filteredEquipmentList.length} รายการ
            </p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {filteredEquipmentList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-14 w-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center mb-4">
                  <Package className="h-7 w-7 text-gray-200" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {equipmentSearchQuery
                    ? "ไม่พบ Equipment"
                    : "ไม่มีข้อมูล Equipment"}
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  {equipmentSearchQuery
                    ? "ลองเปลี่ยนคำค้นหา"
                    : "เริ่มต้นด้วยการสร้าง catalog แรก"}
                </p>
                {!equipmentSearchQuery && (
                  <button
                    onClick={openEquipmentCreate}
                    className="h-9 px-5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold transition-colors"
                  >
                    เพิ่มเครื่องแรก
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {paginatedEquipment.map((equipment) => {
                  const imgUrl = getEquipmentImageUrl(equipment);
                  const isActive = equipment.status === "ACTIVE";
                  return (
                    <div
                      key={equipment.id}
                      onClick={() => {
                        openEquipmentView(equipment.id);
                        closeEquipmentListDrawer();
                      }}
                      className="group flex gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/40 transition-all cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={equipment.equipment_name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.currentTarget.src = "/machineImageHolder.png";
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                            isActive ? "bg-lime-500" : "bg-amber-400",
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {equipment.equipment_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {getEquipmentTypeLabel(equipment.equipment_type)}
                          </span>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-300">
                            ID: {equipment.id}
                          </span>
                        </div>
                        {equipment.description && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                            {equipment.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEquipmentEdit(equipment.id);
                            closeEquipmentListDrawer();
                          }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center border border-gray-100 text-gray-400 hover:text-gray-700 hover:border-gray-200 transition-all"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {equipmentTotalPages > 1 && (
            <div className="shrink-0 p-4 border-t border-gray-100">
              <Pagination
                currentPage={equipmentPage}
                totalPages={equipmentTotalPages}
                onPageChange={setEquipmentPage}
                totalItems={filteredEquipmentList.length}
                pageSize={EQUIPMENT_PAGE_SIZE}
              />
            </div>
          )}
        </div>
      </Drawer>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Shared Lightbox Overlay */}
      <AnimatePresence>
        {enlargedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedImageUrl(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              className="relative max-h-full max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={enlargedImageUrl}
                className="max-h-[90vh] max-w-[90vw] object-contain drop-shadow-2xl rounded-2xl"
              />
              <button
                onClick={() => setEnlargedImageUrl(null)}
                className="absolute -top-12 sm:-top-4 sm:-right-12 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

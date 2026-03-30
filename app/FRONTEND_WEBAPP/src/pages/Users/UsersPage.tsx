import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../services/UsersAPI";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types/auth.types";
import type { Role } from "../../types/common.types";
import type { UserStatus } from "../../types/user.types";
import {
  Search,
  Trash2,
  Shield,
  Pencil,
  User as UserIcon,
  ShieldCheck,
  X
} from "lucide-react";
import {
  Pagination,
  Input,
  Select,
  PageLoader,
  ToastContainer,
  useToasts,
  Button,
} from "../../components/ui";
import { UserDeleteConfirm } from "../../components/Users/UserDeleteConfirm";
import { cn } from "../../utils/cn";

interface FilterState {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
}

function getImageUrl(user: User): string | null {
  const full = user.image_full_url;
  const key = user.image_url;
  if (full) {
    if (full.startsWith("http")) return full;
    const base = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
    return `${base}${full}`;
  }
  if (key) {
    if (key.startsWith("http")) return key;
    const base = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");
    return `${base}/api/v1/media/${key}`;
  }
  return null;
}

function Avatar({
  user,
  size = "md",
}: {
  user: User;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}) {
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-14 h-14 text-lg",
    "2xl": "w-18 h-18 text-2xl",
    "3xl": "w-24 h-24 text-3xl",
  }[size];

  const imgUrl = getImageUrl(user);
  return (
    <div
      className={cn(
        sizeClass,
        "rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0",
      )}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  root: "Root",
  trainer: "Trainer",
  user: "Member",
};

function RoleTag({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-rose-50 text-rose-600 border-rose-100",
    root: "bg-indigo-50 text-indigo-600 border-indigo-100",
    trainer: "bg-amber-50 text-amber-600 border-amber-100",
    user: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-lg border text-xs font-semibold uppercase ",
      styles[role] || styles.user
    )}>
      {ROLE_LABEL[role] ?? "Member"}
    </span>
  );
}

function UserListItem({
  user,
  onEdit,
  onDeleteRequest,
  canManage,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDeleteRequest: (userId: number) => void;
  canManage: boolean;
}) {
  const isActive = user.status === "ACTIVE";

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(user);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest(user.id);
  };

  return (
    <div className="relative group bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 p-3.5 sm:p-5 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="hidden sm:block"><Avatar user={user} size="2xl" /></div>
          <div className="sm:hidden"><Avatar user={user} size="lg" /></div>
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-[3px] sm:border-4 border-white transition-all",
            isActive ? "bg-lime-500 shadow-[0_0_12px_rgba(132,204,22,0.4)]" : "bg-gray-300"
          )} />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Role */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">
              {user.name}
            </h3>
            <RoleTag role={user.role} />
          </div>

          {/* Row 2: Secondary Info */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm text-gray-500 font-medium mb-2 sm:mb-3">
            <span className="opacity-60 tabular-nums shrink-0">ID: {user.id}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[200px] font-medium opacity-80">{user.email}</span>
          </div>

          {/* Row 3: Trainer & Status badges */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5">
            {user.trainer ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-lime-50 text-lime-600 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-lime-100/50">
                <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="truncate max-w-[80px] sm:max-w-[150px]">{user.trainer.name}</span>
              </div>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 italic">No Trainer</span>
            )}

            {!isActive && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold border border-rose-100/50 uppercase tracking-wider">
                Suspended
              </span>
            )}
          </div>
        </div>

        {/* Action Panel: Visible on group hover */}
        {canManage && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleEdit}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-lime-500 hover:text-white transition-all"
              title="แก้ไข"
            >
              <Pencil size={12} strokeWidth={3} />
            </button>
            <button
              onClick={handleDelete}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-500 hover:text-white transition-all"
              title="ลบ"
            >
              <Trash2 size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserModal({
  isOpen,
  user,
  onClose,
  onSave,
  onAssignTrainer,
  onUnassignTrainer,
  trainers,
  isLoadingTrainers,
  onDelete,
  isDeleting,
  confirmDeleteId,
  setConfirmDeleteId,
}: {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: number, role: Role, status: string) => Promise<void>;
  onAssignTrainer: (userId: number, trainerId: number) => Promise<void>;
  onUnassignTrainer: (userId: number) => Promise<void>;
  trainers: User[];
  isLoadingTrainers: boolean;
  onDelete: (userId: number) => Promise<void>;
  isDeleting: boolean;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
}) {
  const [role, setRole] = useState<Role>("user");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStatus(user.status || "ACTIVE");
      setSelectedTrainer(user.trainer?.id || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await onSave(user.id, role, status);
      if (
        selectedTrainer &&
        (!user.trainer || user.trainer.id !== selectedTrainer)
      ) {
        await onAssignTrainer(user.id, selectedTrainer);
      } else if (!selectedTrainer && user.trainer) {
        await onUnassignTrainer(user.id);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl w-full sm:w-[min(480px,95vw)] overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-gray-200" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar user={user} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-gray-900 truncate">
                  {user.name}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-500">
                  <Shield size={11} className="text-gray-400" />ID: {user.id}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors flex-shrink-0 ml-3"
          >
            <X size={16} />
          </button>
        </div>

        {/* fields */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ">
              บทบาทในระบบ
            </label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-11 rounded-xl bg-gray-50 border-gray-100"
            >
              <option value="user">สมาชิกทั่วไป</option>
              <option value="trainer">เทรนเนอร์</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ">
              สถานะการใช้งาน
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 rounded-xl bg-gray-50 border-gray-100"
            >
              <option value="ACTIVE">อนุญาต — ใช้งานปกติ</option>
              <option value="SUSPENDED">ระงับ — ไม่อนุญาต</option>
            </Select>
          </div>
          {role === "user" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase ">
                เทรนเนอร์ที่ดูแล
              </label>
              <Select
                value={selectedTrainer || ""}
                onChange={(e) =>
                  setSelectedTrainer(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={isLoadingTrainers}
                className="h-11 rounded-xl bg-gray-50 border-gray-100"
              >
                <option value="">— ไม่มีเทรนเนอร์ —</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* actions — Always horizontal row for premium feel */}
        <div className="px-6 pb-8 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="px-4 h-11 border-gray-100 text-gray-400 hover:text-gray-900"
            >
              ยกเลิก
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              loading={isSaving}
              className="flex-1 h-11 bg-lime-500 hover:bg-lime-600 border-none shadow-sm text-white"
            >
              <span className="truncate">บันทึกข้อมูล</span>
            </Button>

            <Button
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (confirmDeleteId === user.id) {
                  onDelete(user.id);
                } else {
                  setConfirmDeleteId(user.id);
                }
              }}
              disabled={isSaving || isDeleting}
              loading={isDeleting && confirmDeleteId === user.id}
              className={cn(
                "h-11 shrink-0 transition-all duration-300",
                confirmDeleteId === user.id
                  ? "flex-1 sm:max-w-[150px]"
                  : "w-11 p-0",
              )}
              title="ลบผู้ใช้"
            >
              <Trash2 className="h-4 w-4" />
              {confirmDeleteId === user.id && (
                <span className="ml-1 text-xs font-bold truncate">
                  ยืนยันการลบ
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UsersPage ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const { toasts, addToast, removeToast } = useToasts();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    roleFilter: "",
    statusFilter: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filters.searchQuery, filters.roleFilter, filters.statusFilter]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 20;
  const canManageUsers =
    currentUser?.role === "admin" || currentUser?.role === "root";

  const hasSearch = (filters.searchQuery || "").trim() !== "";

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", hasSearch ? "search" : "paged", page, filters.roleFilter, filters.statusFilter],
    queryFn: async () => {
      const role = filters.roleFilter || undefined;
      const status = filters.statusFilter || undefined;

      // IMPORTANT: backend clamps page_size (e.g. max 20), so to search across ALL users
      // we need to fetch all pages and filter client-side.
      if (hasSearch) {
        const first = await usersApi.getAll(1, pageSize, role, status);
        const totalPages = Math.max(1, Math.ceil(first.total / pageSize));
        if (totalPages <= 1) return first;

        const restPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, idx) => idx + 2).map((p) =>
            usersApi.getAll(p, pageSize, role, status),
          ),
        );

        return {
          ...first,
          users: [first.users, ...restPages.map((r) => r.users)].flat(),
          page: 1,
          page_size: pageSize,
        };
      }

      return usersApi.getAll(page, pageSize, role, status);
    },
    enabled: canManageUsers,
  });

  const { data: trainersData, isLoading: isLoadingTrainers } = useQuery({
    queryKey: ["trainers"],
    queryFn: () => usersApi.getAll(1, 1000, "trainer"),
    enabled: canManageUsers,
  });

  const trainers = useMemo(() => trainersData?.users || [], [trainersData]);

  const updateRoleMut = useMutation({
    mutationFn: ({
      userId,
      role,
      status,
    }: {
      userId: number;
      role: Role;
      status: string;
    }) =>
      Promise.all([
        usersApi.updateRole(userId, role),
        usersApi.updateStatus(userId, status as UserStatus),
      ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "อัปเดตข้อมูลสำเร็จ");
    },
  });

  const assignTrainerMut = useMutation({
    mutationFn: ({
      userId,
      trainerId,
    }: {
      userId: number;
      trainerId: number;
    }) => usersApi.assignTrainer(userId, trainerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "กำหนดเทรนเนอร์สำเร็จ");
    },
  });

  const unassignTrainerMut = useMutation({
    mutationFn: (userId: number) => usersApi.unassignTrainer(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "ยกเลิกเทรนเนอร์สำเร็จ");
    },
  });

  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    const s = (filters.searchQuery || "").trim().toLowerCase();
    if (!s) return usersData.users;

    return usersData.users.filter((u) => {
      const matchName = u.name.toLowerCase().includes(s);
      const matchEmail = u.email.toLowerCase().includes(s);
      const matchId =
        String(u.id) === s ||
        (s.length <= 8 && !Number.isNaN(Number(s)) && u.id === Number(s));
      return matchName || matchEmail || matchId;
    });
  }, [usersData?.users, filters.searchQuery]);

  const paginatedUsers = useMemo(() => {
    if (hasSearch) {
      const start = (page - 1) * pageSize;
      return filteredUsers.slice(start, start + pageSize);
    }
    return filteredUsers;
  }, [hasSearch, page, pageSize, filteredUsers]);

  const totalFiltered = hasSearch ? filteredUsers.length : (usersData?.total ?? 0);
  const totalPagesFiltered = hasSearch
    ? Math.max(1, Math.ceil(filteredUsers.length / pageSize))
    : Math.ceil((usersData?.total ?? 0) / pageSize);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(userId);
      setConfirmDeleteId(null);
      refetch();
      addToast("success", "ลบสมาชิกสำเร็จ");
    } catch {
      addToast("error", "ไม่สามารถลบผู้ใช้ได้");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoader message="กำลังโหลดข้อมูลสมาชิก..." />;

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 max-w-sm text-center">
          <Shield size={48} className="text-gray-100 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          <p className="text-sm text-gray-400">
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            GYMMATE
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ">
              จัดการสมาชิก
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-semibold text-gray-500 uppercase">
              <Shield size={12} className="text-lime-500" />
              Admin Mode
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400 font-medium">
            {hasSearch
              ? `พบ ${totalFiltered} คน (จากทั้งหมด ${usersData?.total ?? 0} คน)`
              : `สมาชิกทั้งหมด ${usersData?.total ?? 0} คน`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            <Input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล หรือ ID..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((p) => ({ ...p, searchQuery: e.target.value }))
              }
              className="pl-10 h-11 bg-white border-gray-100 rounded-xl placeholder:text-gray-300 shadow-sm focus:border-lime-400 focus:ring-lime-500/10"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-11 flex items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <Select
                value={filters.roleFilter}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, roleFilter: e.target.value }))
                }
                className="w-full border-none bg-transparent h-full text-sm uppercase focus:ring-0"
              >
                <option value="">บทบาททั้งหมด</option>
                <option value="user">สมาชิก</option>
                <option value="trainer">เทรนเนอร์</option>
                <option value="admin">ผู้ดูแล</option>
              </Select>
            </div>
            <div className="flex-1 h-11 flex items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <Select
                value={filters.statusFilter}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, statusFilter: e.target.value }))
                }
                className="w-full border-none bg-transparent h-full text-sm uppercase focus:ring-0"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="ACTIVE">ใช้งานปกติ</option>
                <option value="SUSPENDED">ระงับ</option>
              </Select>
            </div>
          </div>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
              <UserIcon className="h-12 w-12 text-gray-100 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                ไม่พบรายชื่อสมาชิก
              </h3>
              <p className="text-xs text-gray-400">ลองปรับตัวกรองใหม่</p>
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDeleteRequest={(id) => {
                  setConfirmDeleteId(id);
                }}
                canManage={canManageUsers}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {usersData && totalFiltered > pageSize && (
          <Pagination
            currentPage={page}
            totalPages={totalPagesFiltered}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            totalItems={totalFiltered}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={async (u, r, s) => {
          await updateRoleMut.mutateAsync({ userId: u, role: r, status: s });
        }}
        onAssignTrainer={async (u, t) => {
          await assignTrainerMut.mutateAsync({ userId: u, trainerId: t });
        }}
        onUnassignTrainer={async (u) => {
          await unassignTrainerMut.mutateAsync(u);
        }}
        trainers={trainers}
        isLoadingTrainers={isLoadingTrainers}
        onDelete={handleDeleteUser}
        isDeleting={isDeleting}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
      />

      {confirmDeleteId && !isModalOpen && (
        <UserDeleteConfirm
          confirmDeleteId={confirmDeleteId}
          submitting={isDeleting}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

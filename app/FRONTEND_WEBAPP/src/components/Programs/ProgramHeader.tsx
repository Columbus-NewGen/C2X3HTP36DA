import { Plus } from "lucide-react";
import { Button } from "../ui";
import { useAuth } from "../../hooks/useAuth";

interface ProgramHeaderProps {
  totalPrograms: number;
  templateCount: number;
  onCreate: () => void;
}

export function ProgramHeader({
  totalPrograms,
  templateCount,
  onCreate,
}: ProgramHeaderProps) {
  const { user } = useAuth();
  const canManage = ["trainer", "admin", "root"].includes(user?.role || "");
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-xs font-bold text-gray-400 uppercase mb-1">
            GYMMATE
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            โปรแกรมการฝึก
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            จำนวนโปรแกรมทั้งหมด: {totalPrograms} โปรแกรม · {templateCount} เทมเพลต
          </p>
        </div>
        {canManage && (
          <Button
            onClick={onCreate}
            className="shrink-0 bg-lime-500 hover:bg-lime-600 border-none shadow-lime-500/20 px-6 h-11 rounded-2xl w-full sm:w-auto text-sm"
          >
            <Plus className="h-5 w-5" />
            <span>เพิ่มโปรแกรมใหม่</span>
          </Button>
        )}
      </div>
    </div>
  );
}


import { AlertCircle } from "lucide-react";
import { Button } from "../ui";

interface ProgramDeleteConfirmProps {
  confirmDeleteId: number | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (id: number) => void;
}

export function ProgramDeleteConfirm({
  confirmDeleteId,
  submitting,
  onCancel,
  onConfirm,
}: ProgramDeleteConfirmProps) {
  if (!confirmDeleteId) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[min(400px,90vw)] rounded-xl border border-rose-200 bg-white p-4 sm:p-5 shadow-xl">
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 mb-1">
            ยืนยันการลบ
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            คุณแน่ใจหรือไม่ว่าต้องการลบโปรแกรมนี้?
            การกระทำนี้ไม่สามารถยกเลิกได้
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
          className="w-full sm:w-auto text-sm"
        >
          ยกเลิก
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onConfirm(confirmDeleteId)}
          disabled={submitting}
          loading={submitting}
          className="w-full sm:w-auto text-sm"
        >
          ลบโปรแกรม
        </Button>
      </div>
    </div>
  );
}


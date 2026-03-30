import { Search, X } from "lucide-react";
import { type DifficultyLevel } from "../../types/program.types";
import { type SortKey } from "../../utils/programs.utils";

interface ProgramFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: DifficultyLevel | "ALL";
  onDifficultyChange: (value: DifficultyLevel | "ALL") => void;
  templateFilter: boolean | "ALL";
  onTemplateChange: (value: boolean | "ALL") => void;
  sortKey: SortKey;
  onSortChange: (value: SortKey) => void;
  totalFiltered: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function ProgramFilters({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  templateFilter,
  onTemplateChange,
  sortKey,
  onSortChange,
  totalFiltered,
  hasActiveFilters,
  onResetFilters,
}: ProgramFiltersProps) {
  const TEMPLATE_OPTIONS = [
    { key: "ALL", label: "ทั้งหมด", value: "ALL" as const },
    { key: "TEMPLATE", label: "เทมเพลต", value: true as const },
    { key: "USER", label: "เฉพาะผู้ใช้", value: false as const },
  ];

  return (
    <div className="mb-4 space-y-2">
      {/* Search */}
      <div className="relative">
        <label htmlFor="program-search" className="sr-only">
          ค้นหาโปรแกรม
        </label>

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

        <input
          id="program-search"
          type="text"
          placeholder="ค้นหาชื่อโปรแกรม หรือเป้าหมาย"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="ล้างคำค้นหา"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Template Toggle */}
        <div className="flex items-center gap-1">
          {TEMPLATE_OPTIONS.map((opt) => {
            const active =
              templateFilter === opt.value ||
              (opt.value === "ALL" && templateFilter === "ALL");

            return (
              <button
                key={opt.key}
                onClick={() => onTemplateChange(opt.value)}
                aria-pressed={active}
                className={`h-8 px-3 rounded-full text-sm font-medium transition border ${
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty */}
        <select
          value={difficultyFilter}
          onChange={(e) =>
            onDifficultyChange(e.target.value as DifficultyLevel | "ALL")
          }
          aria-label="กรองตามระดับความยาก"
          className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition"
        >
          <option value="ALL">ระดับความยาก</option>
          <option value="beginner">เริ่มต้น</option>
          <option value="intermediate">ปานกลาง</option>
          <option value="advanced">ขั้นสูง</option>
        </select>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          aria-label="เรียงลำดับ"
          className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition"
        >
          <option value="updatedDesc">ล่าสุด</option>
          <option value="nameAsc">ชื่อ A-Z</option>
          <option value="difficultyAsc">ความยาก</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="h-8 px-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            ล้างตัวกรอง
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500">
          {totalFiltered} รายการ
        </span>
      </div>
    </div>
  );
}

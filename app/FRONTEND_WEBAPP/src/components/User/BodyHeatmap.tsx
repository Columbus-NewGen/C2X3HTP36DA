import { useMemo, useState } from "react";
import Model, {
  type IExerciseData,
  type IMuscleStats,
  type Muscle,
} from "react-body-highlighter";

type MuscleId =
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "ABS"
  | "QUADS"
  | "HAMSTRINGS"
  | "GLUTES"
  | "CALVES";

type MuscleScores = Record<MuscleId, number>; // 0..100

const MUSCLE_NAMES: Record<string, string> = {
  chest: "หน้าอก",
  "upper-back": "หลังส่วนบน",
  trapezius: "กล้ามเนื้อคอ",
  "lower-back": "หลังส่วนล่าง",
  "front-deltoids": "ไหล่หน้า",
  "back-deltoids": "ไหล่หลัง",
  biceps: "ไบเซ็ป",
  triceps: "ไตรเซ็ป",
  abs: "หน้าท้อง",
  obliques: "ข้างท้อง",
  quadriceps: "ต้นขาหน้า",
  hamstring: "ต้นขาหลัง",
  gluteal: "สะโพก",
  calves: "น่อง",
};

// map คะแนน 0..100 -> frequency 1..N (0 = ไม่โชว์)
function scoreToFreq(score: number, max: number) {
  if (score <= 0) return 0;
  const t = Math.max(0, Math.min(1, score / 100));
  return Math.max(1, Math.min(max, Math.ceil(t * max)));
}

function toBodyHighlighterData(
  scores: MuscleScores,
  maxFreq: number
): IExerciseData[] {
  const f = (id: MuscleId) => scoreToFreq(scores[id] ?? 0, maxFreq);

  // ทำเป็น “virtual exercises” ต่อกล้ามเนื้อ เพื่อคุม intensity ได้แม่น ๆ
  const items: { name: string; muscles: string[]; freq: number }[] = [
    { name: "Chest", muscles: ["chest"], freq: f("CHEST") },
    // BACK: แยกเป็น upper/lower ให้ดูละเอียดขึ้น
    {
      name: "Upper Back",
      muscles: ["upper-back", "trapezius"],
      freq: f("BACK"),
    },
    { name: "Lower Back", muscles: ["lower-back"], freq: f("BACK") },

    // SHOULDERS: lib มี front-deltoids / back-deltoids
    {
      name: "Shoulders",
      muscles: ["front-deltoids", "back-deltoids"],
      freq: f("SHOULDERS"),
    },

    { name: "Biceps", muscles: ["biceps"], freq: f("BICEPS") },
    { name: "Triceps", muscles: ["triceps"], freq: f("TRICEPS") },

    // ABS: เพิ่ม obliques เพื่อให้เหมือนงานจริง
    { name: "Abs", muscles: ["abs", "obliques"], freq: f("ABS") },

    { name: "Quads", muscles: ["quadriceps"], freq: f("QUADS") },
    { name: "Hamstrings", muscles: ["hamstring"], freq: f("HAMSTRINGS") },
    { name: "Glutes", muscles: ["gluteal"], freq: f("GLUTES") },
    { name: "Calves", muscles: ["calves"], freq: f("CALVES") },
  ];

  return items
    .filter((x) => x.freq > 0)
    .map(
      (x): IExerciseData => ({
        name: x.name,
        muscles: x.muscles as Muscle[],
        frequency: x.freq, // สำคัญ: ใช้คุมความเข้ม
      })
    );
}

export function BodyHeatmap({
  scores,
  onMuscleClick,
  compact = false,
}: {
  scores: MuscleScores;
  onMuscleClick?: (s: IMuscleStats) => void;
  compact?: boolean;
}) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // ใช้เฉดสีเขียวไล่ตามความเข้ม 5 ระดับ
  const highlightedColors = useMemo(
    () => ["#d9f99d", "#bef264", "#a3e635", "#84cc16", "#65a30d"],
    []
  );

  const data = useMemo(
    () => toBodyHighlighterData(scores, highlightedColors.length),
    [scores, highlightedColors.length]
  );

  // ขนาดสำหรับ compact mode (ใน Modal) vs full mode - ลดขนาดลง
  const containerClass = compact
    ? "grid grid-cols-2 gap-2 max-w-sm mx-auto"
    : "grid grid-cols-2 gap-3 max-w-lg mx-auto";

  const cardClass = compact
    ? "rounded-xl border border-gray-200 bg-white p-2"
    : "rounded-xl border border-gray-200 bg-white p-3";

  const modelStyle = compact
    ? { width: "100%", maxWidth: "120px", margin: "0 auto", padding: "0.25rem" }
    : { width: "100%", maxWidth: "160px", margin: "0 auto", padding: "0.5rem" };

  const handleMuscleClick = (s: IMuscleStats) => {
    const muscleData = s as any;
    setHoveredMuscle(`${MUSCLE_NAMES[muscleData.muscle] || muscleData.muscle}: ${muscleData.frequency || 0} ครั้ง`);
    onMuscleClick?.(s);
  };

  return (
    <div className="relative">
      <div className={containerClass}>
        <div className={cardClass}>
          <div
            className={`mb-1 text-center text-xs font-semibold text-gray-900 ${
              compact ? "" : "text-sm mb-2"
            }`}
          >
            ด้านหน้า
          </div>
          <Model
            type="anterior"
            data={data}
            highlightedColors={highlightedColors}
            bodyColor="#e5e7eb"
            style={modelStyle}
            onClick={handleMuscleClick}
          />
        </div>

        <div className={cardClass}>
          <div
            className={`mb-1 text-center text-xs font-semibold text-gray-900 ${
              compact ? "" : "text-sm mb-2"
            }`}
          >
            ด้านหลัง
          </div>
          <Model
            type="posterior"
            data={data}
            highlightedColors={highlightedColors}
            bodyColor="#e5e7eb"
            style={modelStyle}
            onClick={handleMuscleClick}
          />
        </div>
      </div>

      {/* Tooltip แสดงชื่อกล้ามเนื้อและค่า */}
      {hoveredMuscle && (
        <div className="mt-3 p-3 bg-lime-50 border border-lime-200 rounded-lg text-center">
          <p className="text-sm font-bold text-lime-900">
            {hoveredMuscle}
          </p>
        </div>
      )}
    </div>
  );
}

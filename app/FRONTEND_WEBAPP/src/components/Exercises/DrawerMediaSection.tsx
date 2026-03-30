import React from "react";
import { Image as ImageIcon, Video, Weight } from "lucide-react";
import { SectionTitle } from "../../components/ui";
import { isLikelyYouTube, toEmbedUrl } from "../../utils/exercise.utils";
import type { ExerciseDisplay } from "../../types/exercise.types";

interface DrawerMediaSectionProps {
  exercise: ExerciseDisplay;
}

/**
 * Media section with clear labels per item.
 * Each media (รูปภาพ, วิดีโอ) is shown in its own card with a visible label
 * so users immediately know what they're looking at.
 */
export function DrawerMediaSection({ exercise }: DrawerMediaSectionProps) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={ImageIcon}
        title="สื่อประกอบ"
        desc="Visuals & Video Guide"
      />
      <div className="grid grid-cols-1 gap-4">
        {/* รูปภาพ */}
        <MediaCard
          label="รูปภาพท่าฝึก"
          icon={<ImageIcon className="h-3.5 w-3.5" />}
        >
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {exercise.image ? (
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-48 sm:h-64 object-contain p-4 bg-gray-50/30"
              />
            ) : (
              <div className="h-48 sm:h-64 flex flex-col items-center justify-center bg-gray-50/30 p-8 text-center">
                <Weight className="h-10 w-10 text-gray-200 mb-2" />
                <p className="text-xs font-bold text-gray-300 uppercase ">ไม่มีรูปภาพประกอบ</p>
              </div>
            )}
          </div>
        </MediaCard>

        {/* วิดีโอ */}
        {exercise.videoUrl && (
          <MediaCard
            label="วิดีโอสาธิต"
            icon={<Video className="h-3.5 w-3.5" />}
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {isLikelyYouTube(exercise.videoUrl) ? (
                <iframe
                  src={toEmbedUrl(exercise.videoUrl)}
                  title={exercise.name}
                  className="w-full h-48 sm:h-64"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 flex flex-col items-center justify-center bg-gray-50/30 text-center">
                  <Video className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase  mb-4">Video Link Detected</p>
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center h-9 px-4 rounded-xl bg-white border border-gray-100 text-xs font-bold text-lime-600 uppercase  shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    เปิดดูวิดีโอภายนอก
                  </a>
                </div>
              )}
            </div>
          </MediaCard>
        )}
      </div>
    </div>
  );
}

function MediaCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2 ml-1">
        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-lime-500 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase ">{label}</span>
      </div>
      {children}
    </div>
  );
}

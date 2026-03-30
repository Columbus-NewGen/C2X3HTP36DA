import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, UserRound, Settings } from "lucide-react";
import type { User } from "../../types/auth.types";

function getImageUrl(user: User): string | null {
  const full = user.image_full_url;
  const key = user.image_url;
  if (full) {
    if (full.startsWith("http")) return full;
    return `${(import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "")}${full}`;
  }
  if (key) {
    if (key.startsWith("http")) return key;
    return `${(import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "")}/api/v1/media/${key}`;
  }
  return null;
}

const ROLE_LABEL: Record<string, string> = {
  root: "เจ้าของระบบ",
  admin: "ผู้ดูแลระบบ",
  trainer: "เทรนเนอร์",
  user: "สมาชิก",
};

interface ProfileHeaderProps {
  user: User;
  onImageSelect: (file: File) => void;
  isUploadingImage: boolean;
  onEdit?: () => void;
}

export default function ProfileHeader({
  user,
  onImageSelect,
  isUploadingImage,
  onEdit,
}: ProfileHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgErr, setImgErr] = useState(false);
  const imageUrl = getImageUrl(user);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = "";
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 ring-2 ring-neutral-100">
          {imageUrl && !imgErr ? (
            <img
              src={imageUrl}
              alt={user.name}
              className="h-full w-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <UserRound className="h-7 w-7 text-neutral-400" />
            </div>
          )}
          {isUploadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
            </div>
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-lg bg-lime-500 text-white flex items-center justify-center shadow-sm hover:bg-lime-600 transition-all active:scale-90 cursor-pointer"
          aria-label="เปลี่ยนรูปโปรไฟล์"
        >
          <Camera className="h-3 w-3" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-neutral-900 truncate leading-tight">{user.name}</h1>
        <p className="text-xs text-neutral-400 font-medium mt-0.5">
          {ROLE_LABEL[user.role] ?? user.role}
          <span className="text-neutral-300 mx-1">·</span>
          ID #{user.id}
        </p>
        {user.email && (
          <p className="text-xs text-neutral-400 truncate mt-0.5">{user.email}</p>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
      >
        <Settings className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">แก้ไข</span>
      </button>
    </div>
  );
}

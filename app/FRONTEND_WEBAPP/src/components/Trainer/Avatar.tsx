import { resolveImageUrl } from "../../utils/floorplan.utils";
import { AuthenticatedImage } from "../ui";
import { initials } from "../../utils/trainer.utils";
import { cn } from "../../utils/cn";
import type { AvatarProps } from "../../types/trainerDashboard.types";

const DIM: Record<string, string> = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-lg",
};

export default function Avatar({ src, name, size = "md" }: AvatarProps) {
    const resolvedSrc = resolveImageUrl(src);

    return (
        <div
            className={cn(
                DIM[size],
                "rounded-2xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-100/50 shadow-sm",
            )}
        >
            {resolvedSrc ? (
                <AuthenticatedImage
                    src={resolvedSrc}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials(name)
            )}
        </div>
    );
}

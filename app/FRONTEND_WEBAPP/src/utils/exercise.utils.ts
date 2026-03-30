import type {
    Exercise as BackendExercise,
    MovementPattern,
    ExerciseDisplay,
} from "../types/exercise.types";
import { cn } from "./cn";

export { cn };

export function toTitle(s: string) {
    if (!s) return "";
    return s
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso?: string | null) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getMovementPatternLabel(pattern: MovementPattern): string {
    const labels: Record<string, string> = {
        squat: "Squat",
        hinge: "Hinge",
        push: "Push",
        pull: "Pull",
        carry: "Carry",
    };
    return labels[pattern] || capitalize(pattern);
}

export function getImageUrl(exercise: BackendExercise): string | null {
    const imageFullUrl = exercise.image_full_url;
    const imageUrl = exercise.image_url;

    const finalUrl = imageFullUrl || imageUrl;
    if (!finalUrl || finalUrl.includes("exerciseImageHolder") || finalUrl.includes("machineImageHolder")) {
        return null;
    }

    if (imageFullUrl) {
        if (imageFullUrl.startsWith("/")) {
            const serverUrl = import.meta.env.VITE_SERVER_URL || "";
            const baseUrl = serverUrl.replace(/\/$/, "");
            return `${baseUrl}${imageFullUrl}`;
        }
        if (
            imageFullUrl.startsWith("http://") ||
            imageFullUrl.startsWith("https://")
        ) {
            return imageFullUrl;
        }
    }

    if (imageUrl) {
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        const serverUrl = import.meta.env.VITE_SERVER_URL || "";
        const baseUrl = serverUrl.replace(/\/$/, "");
        return `${baseUrl}/api/v1/media/${imageUrl}`;
    }

    return null;
}

export function mapToDisplay(exercise: BackendExercise): ExerciseDisplay {
    const imageUrl = getImageUrl(exercise);
    return {
        id: exercise.id,
        name: exercise.exercise_name,
        movementPattern: exercise.movement_pattern,
        movementType: exercise.movement_type,
        difficulty: exercise.difficulty_level,
        description: exercise.description,
        isCompound: exercise.is_compound,
        image: imageUrl,
        videoUrl: exercise.video_url,
        createdAt: exercise.created_at,
        updatedAt: exercise.updated_at,
    };
}

export function isLikelyYouTube(url: string) {
    if (!url) return false;
    const u = url.toLowerCase();
    return u.includes("youtube.com") || u.includes("youtu.be");
}

export function toEmbedUrl(url: string) {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${id}`;
        }
        if (u.hostname.includes("youtube.com")) {
            const id = u.searchParams.get("v");
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    } catch {
        return url;
    }
}

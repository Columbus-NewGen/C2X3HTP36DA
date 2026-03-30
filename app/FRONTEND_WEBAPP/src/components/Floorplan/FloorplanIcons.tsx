/**
 * Floorplan Icons
 * SVG icon components used across floorplan pages
 */

interface IconProps {
    className?: string;
    size?: number;
}

export const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
    </svg>
);

export const CubeIcon: React.FC<IconProps> = ({ className = "w-5 h-5 text-gray-400", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
    </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ className = "w-5 h-5 text-gray-400", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
    </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
        />
    </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
        />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
    </svg>
);

export const ZoomInIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
        />
    </svg>
);

export const ZoomOutIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
        />
    </svg>
);

export const UndoIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
    </svg>
);

export const RedoIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
        />
    </svg>
);

export const SidebarIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
        />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
    <svg
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
        />
    </svg>
);

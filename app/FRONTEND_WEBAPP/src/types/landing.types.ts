// Types for Landing Page components

export interface AuthState {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
}

export interface NavbarProps {
    scrolled: boolean;
    isLoggedIn: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (value: boolean) => void;
    handleMockAuth: () => void;
}

export interface HeroSectionProps {
    isLoggedIn: boolean;
    handleMockAuth: () => void;
}

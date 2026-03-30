import { useState } from "react";
import { Navbar, HeroSection } from "../components/Landing";
import Footer from "../components/Footer";
import { useScrollDetection } from "../hooks/useScrollDetection";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useScrollDetection();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-white text-gray-900 selection:bg-lime-200">
        <Navbar
          scrolled={scrolled}
          isLoggedIn={isAuthenticated}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleMockAuth={handleAuth}
        />

        <HeroSection isLoggedIn={isAuthenticated} handleMockAuth={handleAuth} />
      </div>
      <Footer />
    </div>
  );
}

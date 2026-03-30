import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Navbar from "../components/LeftNavbar";
import Footer from "../components/Footer";

export default function MainLayout(): React.ReactElement {
  const [open, setOpen] = useState(false);
  // No special logic for fullscreen page needed here anymore

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Topbar (mobile) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shrink-0">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 select-none group">
            <img src="/logo-gymmate192.png" alt="Logo" className="h-7 w-7" />
            <span className="text-xl font-bold  text-gray-900 group-hover:opacity-80 transition-opacity">
              GYM<span className="text-lime-600">MATE</span>
            </span>
          </div>

          <div className="w-10" /> {/* Spacer for centering logo */}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 min-h-0">
        <Navbar isOpen={open} onClose={() => setOpen(false)} />

        <main className="flex-1 min-h-0 min-w-0 px-4 lg:px-8 py-6 lg:ml-64">
          <Outlet />
        </main>
      </div>

      <div className="shrink-0 lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}

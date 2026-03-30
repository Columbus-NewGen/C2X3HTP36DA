import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Navbar from "../components/LeftNavbar";
// Footer is typically omitted in full-screen apps to maximize space,
// but can be added if needed. For now, omitting to match typical "app-like" feel.

export default function FullScreenLayout(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-white">
      {/* Topbar (mobile/tablet — show until lg so user can open nav on iPad etc.) */}
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
            <img src="/logo-gymmate192.png" alt="Logo" className="h-9 w-auto" />
            <span className="text-xl font-bold  text-gray-900 group-hover:opacity-80 transition-opacity">
              GYM<span className="text-lime-600">MATE</span>
            </span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Navbar isOpen={open} onClose={() => setOpen(false)} />

        {/* Main Content: Flex column, overflow hidden to contain the canvas/viewer */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative lg:ml-64 bg-gray-50/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

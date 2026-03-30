import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Signin from "../../components/Auth/Signin";
import Signup from "../../components/Auth/Signup";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-lime-50 selection:bg-lime-200 px-4 py-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-lime-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-zinc-200/30 rounded-full blur-3xl" />

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Clickable Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-3 mb-8 cursor-pointer group select-none"
        >
          <img src={"/logo-gymmate192.png"} alt="GymMate" className="h-10 w-10" />

          <span className="text-xl font-bold text-bold  transition-colors duration-300 group-hover:text-zinc-700">
            GymMate
          </span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-8">
          {mode === "signin" ? (
            <Signin onSwitchToSignup={() => setMode("signup")} />
          ) : (
            <Signup onSwitchToSignin={() => setMode("signin")} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-400 text-xs mt-6">
          © 2024 GymMate. All rights reserved.
        </p>
      </div>
    </div>
  );
}

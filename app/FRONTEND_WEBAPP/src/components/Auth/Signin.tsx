import React, { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SigninProps {
  onSwitchToSignup: () => void;
}

export default function Signin({ onSwitchToSignup }: SigninProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate("/app");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Sign in failed. Please check your credentials and try again.";
      if (import.meta.env.DEV) {
        console.error("Login error:", err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = () => {
  //   // TODO: Implement Google OAuth
  //   setError("Google sign-in is not yet implemented.");
  // };

  // const handleCMUSignIn = () => {
  //   // TODO: Implement CMU OAuth
  //   setError("CMU sign-in is not yet implemented.");
  // };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bold mb-2">ยินดีต้อนรับกลับมา</h1>
        <p className="text-zinc-500">
          เข้าสู่ระบบเพื่อดำเนินการเส้นทางฟิตเนสของคุณต่อ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">อีเมล</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-bold placeholder:text-zinc-400 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">รหัสผ่าน</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-zinc-200 bg-white text-bold placeholder:text-zinc-400 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-lime-600 hover:text-lime-700 font-medium"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-bold font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-lime-400/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              เข้าสู่ระบบ
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Divider
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-zinc-500">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        {/* <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
          >
            <Chrome className="w-5 h-5 text-zinc-600" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleCMUSignIn}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
          >
            <GraduationCap className="w-5 h-5 text-zinc-600" />
            <span>CMU</span>
          </button>
        </div>  */}
      </form>

      {/* Switch to Signup */}
      <p className="mt-8 text-center text-zinc-500">
        ยังไม่มีบัญชีใช่หรือไม่?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-lime-600 hover:text-lime-700 font-semibold"
        >
          ลงทะเบียน
        </button>
      </p>
    </div>
  );
}

import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  onSwitchToSignin: () => void;
}

export default function Signup({ onSwitchToSignin }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: "อย่างน้อย 8 ตัวอักษร", met: password.length >= 8 },
    { label: "ต้องมีตัวเลข", met: /\d/.test(password) },
    { label: "ต้องมีตัวพิมพ์ใหญ่", met: /[A-Z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((r) => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!allRequirementsMet) {
      setError("Password does not meet the required criteria.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/app");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Sign up failed. Please try again.";
      if (import.meta.env.DEV) {
        console.error("Registration error:", err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignUp = () => {
  //   // TODO: Implement Google OAuth
  //   setError("Google sign-up is not yet implemented.");
  // };

  // const handleCMUSignUp = () => {
  //   // TODO: Implement CMU OAuth
  //   setError("CMU sign-up is not yet implemented.");
  // };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bold mb-2">สร้างบัญชีใหม่</h1>
        <p className="text-zinc-500">เริ่มต้นเส้นทางฟิตเนสของคุณตั้งแต่วันนี้</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">ชื่อ-นามสกุล</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-bold placeholder:text-zinc-400 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
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
        <div className="space-y-1.5">
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
          {/* Password Requirements */}
          {password && (
            <div className="flex flex-wrap gap-2 mt-2">
              {passwordRequirements.map((req, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${req.met
                    ? "bg-lime-100 text-lime-700"
                    : "bg-zinc-100 text-zinc-500"
                    }`}
                >
                  {req.met && <Check className="w-3 h-3" />}
                  {req.label === "At least 8 characters" ? "อย่างน้อย 8 ตัวอักษร" :
                    req.label === "Contains a number" ? "ต้องมีตัวเลข" :
                      req.label === "Contains uppercase" ? "ต้องมีตัวพิมพ์ใหญ่" : req.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            ยืนยันรหัสผ่าน
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              required
              className={`w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-white text-bold placeholder:text-zinc-400 focus:outline-none transition-colors ${confirmPassword && confirmPassword !== password
                ? "border-red-300 focus:border-red-400"
                : "border-zinc-200 focus:border-lime-400"
                }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
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
          disabled={loading || !allRequirementsMet}
          className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-bold font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-lime-400/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังสร้างบัญชี...
            </>
          ) : (
            <>
              สร้างบัญชี
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Divider */}
        {/* <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-zinc-500">or sign up with</span>
          </div>
        </div> */}

        {/* Social Buttons */}
        {/* <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
          >
            <Chrome className="w-5 h-5 text-zinc-600" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleCMUSignUp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-zinc-700"
          >
            <GraduationCap className="w-5 h-5 text-zinc-600" />
            <span>CMU</span>
          </button>
        </div> */}
      </form>

      {/* Switch to Signin */}
      <p className="mt-6 text-center text-zinc-500">
        มีบัญชีอยู่แล้ว?{" "}
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="text-lime-600 hover:text-lime-700 font-semibold"
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
}

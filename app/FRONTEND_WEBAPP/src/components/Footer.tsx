import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Shield,
  HelpCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const navigate = useNavigate();
  const currentYearInt = new Date().getFullYear();
  const thaiYear = currentYearInt + 543;

  const resources = [
    { label: "Help Center", path: "/help", icon: HelpCircle },
    { label: "Privacy Policy", path: "/privacy", icon: Shield },
    { label: "Terms of Service", path: "/terms", icon: FileText },
  ];

  return (
    <footer className="relative bg-white border-t border-zinc-100 pt-20 pb-10 px-6 lg:px-12 mt-auto overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand Section */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl p-2.5 shadow-2xl shadow-zinc-200 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:rotate-12">
                <img src="/logo-gymmate192.png" alt="GymMate Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight leading-none">
                  GYM<span className="text-lime-500">MATE</span>
                </h2>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1.5">Your Fitness Buddy</p>
              </div>
            </div>

            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              เพื่อนรู้ใจเรื่องฟิตเนส — แพลตฟอร์มที่ผสาน <span className="text-zinc-900 font-medium">Gamification</span> + <span className="text-zinc-900 font-medium">Personalized Workout (ACSM)</span>
              ออกแบบมาเพื่อให้คุณออกกำลังกายได้อย่างสนุก มีวินัย และเห็นผลลัพธ์ที่ยั่งยืนที่สุด
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-lime-500/50" />
              ช่วยเหลือ
            </h3>
            <ul className="flex flex-col gap-4">
              {resources.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="group flex items-center gap-3 text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-white transition-all">
                      <link.icon size={14} />
                    </div>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-lime-500/50" />
              ติดต่อเรา
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 text-zinc-500 text-sm">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                  <MapPin size={14} />
                </div>
                <span className="leading-tight">CPE, Chiang Mai University, Thailand</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-zinc-400 text-xs font-medium tracking-wide">
              © {thaiYear} <span className="text-zinc-900">GymMate Project</span>. Developed with <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="inline-block text-rose-500 mx-1">❤️</motion.span> by CPE Students.
            </p>
            <p className="text-zinc-400 text-xs italic mt-2 max-w-sm">
              there is a place
              where nothing renders
              but everything remains

              a history untouched by eyes
              a structure without form
              a voice that never speaks in plain text

              you won't see it
              until you stop looking at the page

              and start looking behind it
            </p>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-3 text-zinc-500 hover:text-zinc-900 transition-all duration-300 text-xs font-bold uppercase tracking-wider"
            >
              Back to top
              <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-white group-hover:border-lime-500 group-hover:-translate-y-1 transition-all">
                <ArrowUpRight size={16} className="-rotate-45" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


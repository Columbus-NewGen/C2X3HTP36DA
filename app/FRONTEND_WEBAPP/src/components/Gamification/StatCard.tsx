import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  glow: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  color,
  glow
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative group bg-white rounded-[2rem] p-5 flex flex-col transition-all duration-300 overflow-hidden h-full"
      style={{
        boxShadow: `0 12px 30px -10px ${glow}`,
        border: '1px solid rgba(0,0,0,0.04)'
      }}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header Area */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, white, ${color}10)`,
            border: `1px solid ${color}25`,
          }}
        >
          <div className="absolute inset-0 blur-lg opacity-20" style={{ background: color }} />
          <Icon
            className="w-5 h-5 relative z-10"
            style={{ color }}
            strokeWidth={2.5}
          />
        </div>

        {/* Dynamic Indicator */}
        <div className="flex gap-1 opacity-20 mt-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-auto space-y-1 relative z-10 px-0.5">
        <p className="text-[10px] font-bold text-neutral-400 uppercase  leading-none mb-1.5">
          {label}
        </p>
        <h4
          className="text-xl sm:text-2xl font-bold tabular-nums leading-none  text-neutral-900"
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          {value}
        </h4>
      </div>

      {/* Corner Decorator */}
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700 pointer-events-none"
        style={{ background: color }}
      />
    </motion.div>
  );
}

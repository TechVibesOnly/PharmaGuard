import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color?: string;
}

export const Gauge = ({ value, min, max, unit, label, color = "stroke-blue-600" }: GaugeProps) => {
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth="8"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            className={cn("fill-none", color)}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-800">{value}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{unit}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</p>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Truck, MapPin } from 'lucide-react';

export const LiveMap = () => {
  // Mock truck paths for animation
  const truck1 = {
    path: "M 50 150 Q 150 50 250 150 T 450 150",
    color: "#007BFF"
  };
  
  const truck2 = {
    path: "M 50 250 C 150 250 150 50 250 50 S 450 250 550 250",
    color: "#28A745"
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
      {/* Schematic Background */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 400">
        <path d="M 0 100 L 600 100 M 0 200 L 600 200 M 0 300 L 600 300" stroke="#CBD5E1" strokeWidth="1" fill="none" strokeDasharray="5,5" />
        <path d="M 100 0 L 100 400 M 200 0 L 200 400 M 300 0 L 300 400 M 400 0 L 400 400 M 500 0 L 500 400" stroke="#CBD5E1" strokeWidth="1" fill="none" strokeDasharray="5,5" />
        
        {/* Animated Paths */}
        <path d={truck1.path} stroke={truck1.color} strokeWidth="2" fill="none" opacity="0.3" />
        <path d={truck2.path} stroke={truck2.color} strokeWidth="2" fill="none" opacity="0.3" />
      </svg>

      {/* Moving Trucks */}
      <motion.div
        className="absolute z-10"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          offsetPath: `path('${truck1.path}')`,
          offsetRotate: "auto"
        }}
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all opacity-0 group-hover:opacity-100" />
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg relative">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm border border-slate-100">
            TRK-EV-042
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute z-10"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
        style={{
          offsetPath: `path('${truck2.path}')`,
          offsetRotate: "auto"
        }}
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <div className="bg-green-600 p-2 rounded-lg shadow-lg relative">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm border border-slate-100">
             TRK-EV-018
          </div>
        </div>
      </motion.div>

      {/* Static Markers */}
      <div className="absolute top-1/4 left-1/4">
        <MapPin className="text-red-500 w-6 h-6 animate-bounce" />
        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-xl border border-white/40 mt-1">
          <p className="text-[10px] font-bold text-slate-800">CENTRAL PHARMA</p>
          <p className="text-[8px] text-slate-500">Node-01</p>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-1/4">
        <MapPin className="text-blue-500 w-6 h-6" />
        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-xl border border-white/40 mt-1">
          <p className="text-[10px] font-bold text-slate-800">REGIONAL HUB</p>
          <p className="text-[8px] text-slate-500">Node-03</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex space-x-4">
        <div className="bg-white/70 backdrop-blur p-2 rounded-lg border border-white/20 flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-blue-600 pulse" />
           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Active EVs</span>
        </div>
        <div className="bg-white/70 backdrop-blur p-2 rounded-lg border border-white/20 flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Temp Alerts</span>
        </div>
      </div>
    </div>
  );
};

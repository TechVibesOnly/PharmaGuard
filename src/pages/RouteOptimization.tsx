import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Map as MapIcon, Zap, Clock, Fuel, Sparkles, 
  ChevronDown, ChevronUp, Save, Filter, Plus, Info, Leaf, 
  TrendingDown, Route as RouteIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import confetti from 'canvas-confetti';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../lib/utils';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const demandHeatmapPoints = [
  { x: "20%", y: "30%", weight: 0.8, label: "Rural Zone A" },
  { x: "70%", y: "40%", weight: 0.6, label: "Suburban Zone B" },
  { x: "40%", y: "75%", weight: 0.9, label: "Critical Demand" },
];

const comparisonData = [
  { name: 'Standard', time: 145, fuel: 12.5, color: '#94A3B8' },
  { name: 'AI Optimized', time: 92, fuel: 7.2, color: '#007BFF' },
];

export default function RouteOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'routes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRoutes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const runOptimizer = async () => {
    setIsOptimizing(true);
    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      await addDoc(collection(db, 'routes'), {
        origin: "Central Hospital",
        destination: "Village Outpost #4",
        isRural: true,
        priority: "high",
        eta: "14:45",
        fuelSavings: 35,
        carbonOffset: 12.5,
        createdAt: new Date().toISOString(),
        driverId: auth.currentUser?.uid
      });
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#007BFF', '#28A745', '#FFC107']
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section with Interactive Map */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Fleet Router</h2>
              <p className="text-sm text-slate-500 italic">Multi-stop heuristic pathfinding for critical payloads</p>
            </div>
            <div className="flex items-center space-x-3">
               <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  "p-2 rounded-xl transition-all shadow-sm flex items-center space-x-2 text-xs font-bold uppercase",
                  showHeatmap ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-white text-slate-400 border border-slate-100"
                )}
               >
                 <Sparkles className="w-4 h-4" />
                 <span>Demand Heatmap</span>
               </button>
               <button className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100">
                  <Filter className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="relative h-[500px] w-full bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner group">
             {/* Map Schematic */}
             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* City Grid */}
                {[...Array(10)].map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1={i * 80} y1="0" x2={i * 80} y2="500" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="10,10" />
                    <line x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="10,10" />
                  </React.Fragment>
                ))}

                {/* Demand Heatmap Overlay */}
                <AnimatePresence>
                  {showHeatmap && demandHeatmapPoints.map((p, i) => (
                    <motion.circle
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      cx={p.x}
                      cy={p.y}
                      r={60}
                      fill={i === 2 ? '#EF4444' : '#F59E0B'}
                    />
                  ))}
                </AnimatePresence>

                {/* Optimized Path Glow */}
                <motion.path
                  d="M 100 100 L 250 150 L 400 100 L 550 300 L 700 250"
                  stroke="#007BFF"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Pins */}
                <motion.g 
                  initial={{ y: -50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 1 }}
                >
                  <circle cx="100" cy="100" r="8" fill="#007BFF" />
                  <circle cx="100" cy="100" r="15" fill="#007BFF" opacity="0.2" className="animate-ping" />
                </motion.g>
                
                <motion.g 
                  initial={{ y: -50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 2.5 }}
                >
                  <circle cx="700" cy="250" r="8" fill="#28A745" />
                  <circle cx="700" cy="250" r="12" fill="#28A745" opacity="0.3" />
                </motion.g>
             </svg>

             {/* UI Overlays on Map */}
             <div className="absolute top-6 left-6 space-y-3">
                <GlassCard className="p-3 bg-slate-900/40 text-white border-white/10 backdrop-blur-md">
                   <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Active Forecast</span>
                   </div>
                   <p className="text-xl font-bold mt-1">1h 22m <span className="text-[10px] text-green-400">Optimal</span></p>
                </GlassCard>
             </div>

             <div className="absolute bottom-6 right-6">
                <button 
                  onClick={runOptimizer}
                  disabled={isOptimizing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all active:scale-95 disabled:bg-slate-400"
                >
                   {isOptimizing ? (
                     <RefreshCw className="w-5 h-5 animate-spin" />
                   ) : (
                     <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                   )}
                   <span className="font-bold uppercase tracking-widest text-sm">Compute Best Path</span>
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <GlassCard className="p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-slate-900 p-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest">AI Comparison</h3>
              </div>
              <p className="text-xs text-slate-400">Heuristic gain over legacy manual routing</p>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Bar Race Animation Simulation */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500">
                    <span>Delivery Time</span>
                    <span className="text-blue-600">-37%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "63%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500">
                    <span>Energy Expenditure</span>
                    <span className="text-green-600">-42%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "58%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <Fuel className="text-blue-600 w-5 h-5 mb-1" />
                    <p className="text-[10px] uppercase font-bold text-blue-400">Fuel Saved</p>
                    <p className="text-lg font-bold text-blue-700">12.4 L</p>
                 </div>
                 <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
                    <Leaf className="text-green-600 w-5 h-5 mb-1" />
                    <p className="text-[10px] uppercase font-bold text-green-400">CO2 Offset</p>
                    <p className="text-lg font-bold text-green-700">32 kg</p>
                 </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center space-x-2 mb-4">
               <TrendingDown className="text-red-500 w-5 h-5" />
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Equity Focus</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our AI prioritizes <strong>subsidized rural routes</strong> by factoring in medical necessity weights above distance cost.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-slate-400">
               <Info className="w-4 h-4" />
               <span>Calculated per SDG-3 guidelines</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Routes Queue */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Optimization Queue</h2>
            <p className="text-sm text-slate-500">Live computed paths awaiting driver dispatch</p>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-slate-800 transition-all">
             <Plus className="w-4 h-4" />
             <span>Create Manual Batch</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <RouteCard 
              key={route.id} 
              route={route} 
              delay={i * 0.1}
              isSelected={selectedRoute === route.id}
              onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
            />
          ))}
          {routes.length === 0 && (
             <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-full">
                  <RouteIcon className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-slate-400 font-medium italic">No optimized routes in queue</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RouteCard({ route, delay, isSelected, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      layout
      className={cn(
        "bg-white rounded-[2rem] border transition-all cursor-pointer overflow-hidden group",
        isSelected ? " ring-2 ring-blue-500 border-transparent shadow-2xl" : "border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200"
      )}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                 <Navigation className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route #{route.id.slice(0,5)}</p>
                 <h4 className="font-bold text-slate-800">{route.eta} Delivery</h4>
              </div>
           </div>
           {route.isRural && (
             <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight">Rural Subsidized</span>
           )}
        </div>

        <div className="space-y-4 relative">
           <div className="flex items-center space-x-3 z-10 relative">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-500">{route.origin}</span>
           </div>
           <div className="absolute left-1 top-2 bottom-2 w-px bg-slate-100 ml-[-1px] border-l border-dashed border-slate-300 z-0" />
           <div className="flex items-center space-x-3 z-10 relative">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800">{route.destination}</span>
           </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
           <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 animate-pulse" />
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">+2</div>
           </div>
           
           <div className="flex items-center space-x-2 text-green-600">
              <Leaf className="w-4 h-4" />
              <span className="text-[11px] font-bold">-{route.carbonOffset}% CO2</span>
           </div>
        </div>
      </div>

      <motion.div 
        initial={false}
        animate={{ height: isSelected ? "auto" : 0 }}
        className="bg-slate-50 overflow-hidden"
      >
        <div className="p-6 pt-0 space-y-4">
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Est. Fuel Savings</p>
                 <p className="text-sm font-bold text-blue-600">{route.fuelSavings}%</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Traffic Factor</p>
                 <p className="text-sm font-bold text-green-600">Minor</p>
              </div>
           </div>
           <button className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Confirm & Dispatch</span>
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

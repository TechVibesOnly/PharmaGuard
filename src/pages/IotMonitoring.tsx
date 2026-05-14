import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Thermometer, Droplets, MapPin, Activity, 
  AlertTriangle, ShieldAlert, Cpu, Download, RefreshCw, BarChart2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GlassCard } from '../components/ui/GlassCard';
import { Gauge } from '../components/ui/Gauge';
import { LiveMap } from '../components/ui/LiveMap';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const tempHistory = [
  { time: '12:00', temp: 4.2 },
  { time: '12:10', temp: 4.5 },
  { time: '12:20', temp: 5.1 },
  { time: '12:30', temp: 4.8 },
  { time: '12:40', temp: 4.6 },
  { time: '12:50', temp: 4.4 },
  { time: '13:00', temp: 7.2 }, // Alert trigger
];

export default function IotMonitoring() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [alertNode, setAlertNode] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'devices'), orderBy('lastSeen', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDevices(docs);
      
      // Simulation: trigger alert on a specific temp
      const breached = docs.find(d => d.temp > 8 || d.temp < 2);
      if (breached) {
        setAlertNode(breached.id);
      } else {
        setAlertNode(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const exportLogs = () => {
    // Mock CSV export
    const csvContent = "data:text/csv;charset=utf-8,ID,Temp,Humidity,Status,LastSeen\n" 
      + devices.map(d => `${d.id},${d.temp},${d.humidity},${d.status},${d.lastSeen}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pharma_iot_logs.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Alert Siren */}
      <AnimatePresence>
        {alertNode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-red-600/40 relative overflow-hidden"
          >
            <motion.div 
               animate={{ x: [-2, 2, -2] }} 
               transition={{ repeat: Infinity, duration: 0.1 }}
               className="flex items-center space-x-4 z-10"
            >
              <ShieldAlert className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg leading-tight tracking-tight uppercase">Critical Thermal Breach Detected</h3>
                <p className="text-red-100 text-xs font-semibold">Node ID: #PG-{alertNode.slice(0,8)} | Temperature: 9.1°C</p>
              </div>
            </motion.div>
            <button className="bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-transform active:scale-95 z-10 hover:bg-red-50">
               Dispatch Emergency Courier
            </button>
            <motion.div 
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Tracking Map */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Transports</h2>
              <p className="text-sm text-slate-500">Real-time GPS nodes & EV movement</p>
            </div>
            <div className="flex items-center space-x-2">
               <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Link Active</span>
            </div>
          </div>
          <LiveMap />
        </div>

        {/* Global Stats */}
        <div className="space-y-6">
           <GlassCard className="bg-slate-900 border-none text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/30">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Integrity</p>
                  <p className="text-2xl font-bold">99.8%</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart storage nodes are maintaining optimal 2-8°C range across (12/14) active territories.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs font-bold text-blue-400 uppercase tracking-tighter">
                <span>View Full Health Audit</span>
                <Cpu className="w-4 h-4" />
              </div>
           </GlassCard>

           <GlassCard>
             <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest flex items-center space-x-2">
               <Zap className="w-4 h-4 text-amber-500" />
               <span>Predictive Risk Factor</span>
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 font-medium">Counterfeit Risk</span>
                 <span className="text-xs font-bold text-green-600">Low (0.2%)</span>
               </div>
               <div className="w-full h-1 bg-slate-100 rounded-full">
                 <div className="w-1/4 h-full bg-blue-500 rounded-full" />
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 font-medium">Battery Level (EV Fleet)</span>
                 <span className="text-xs font-bold text-blue-600">88% Avg</span>
               </div>
               <div className="w-full h-1 bg-slate-100 rounded-full">
                 <div className="w-[88%] h-full bg-blue-500 rounded-full" />
               </div>
             </div>
           </GlassCard>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Storage & Transport Nodes</h2>
            <p className="text-sm text-slate-500">Live sensory telemetry from all devices</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={exportLogs}
               className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 group"
             >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>Export Audit Logs</span>
             </button>
             <button className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 active:rotate-180 transition-transform">
                <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device, idx) => (
            <IotCard key={device.id} device={device} delay={idx * 0.1} />
          ))}
          {devices.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-slate-50 rounded-full">
                 <Cpu className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium italic">Scanning for active IoT nodes...</p>
            </div>
          )}
        </div>
      </section>

      <section>
         <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-bold text-slate-800">Thermal Integrity Index</h3>
                  <p className="text-sm text-slate-500">24-hour historical log for Vaccine Batch #VB-921</p>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                     <div className="w-3 h-3 rounded-full bg-blue-600" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Current Node</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                     <div className="w-3 h-3 rounded-full bg-slate-200" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Fleet</span>
                  </div>
               </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempHistory}>
                  <defs>
                    <linearGradient id="iotTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007BFF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} unit="°C" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#007BFF" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#iotTemp)" 
                  />
                  {/* Threshold marker */}
                  <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#EF4444" strokeDasharray="5 5" opacity="0.5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </GlassCard>
      </section>
    </div>
  );
}

function IotCard({ device, delay }: { device: any, delay: number }) {
  const [flipped, setFlipped] = useState(false);
  const isAlert = device.temp > 8 || device.temp < 2;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, delay }}
      className="relative h-[280px] perspective-1000 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front Face */}
        <div className={cn(
          "absolute inset-0 backface-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 shadow-xl shadow-slate-200/50 flex flex-col justify-between",
          isAlert ? "border-red-500/50 bg-red-50/50" : "border-white/20"
        )}>
          <div className="flex justify-between items-start">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{device.type} Node</p>
                <h4 className="font-bold text-slate-800">#PG-{device.id.slice(0,6).toUpperCase()}</h4>
             </div>
             <div className={cn(
               "p-2 rounded-xl text-white",
               device.status === 'online' ? 'bg-blue-600' : 'bg-slate-400'
             )}>
                {device.type === 'transport' ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
             <Gauge value={device.temp} min={0} max={15} unit="°C" label="Temp" color={isAlert ? "stroke-red-500" : "stroke-blue-600"} />
             <Gauge value={device.humidity} min={0} max={100} unit="%" label="Humidity" color="stroke-indigo-400" />
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
             <span className={isAlert ? 'text-red-600' : 'text-slate-400'}>
               {isAlert ? 'Thermal Breach' : 'Optimal Sync'}
             </span>
             <span className="text-slate-400">Just Now</span>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-3xl p-6 text-white rotate-y-180 flex flex-col justify-between shadow-2xl">
           <div>
              <div className="flex items-center space-x-2 text-blue-400 mb-4">
                <BarChart2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Device Metadata</span>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[10px] text-slate-400 font-medium">Batch ID</span>
                    <span className="text-xs font-mono font-bold">V-BATCH-921</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[10px] text-slate-400 font-medium">Last Calibrated</span>
                    <span className="text-xs font-bold">12 Days Ago</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[10px] text-slate-400 font-medium">Signal Integrity</span>
                    <span className="text-xs font-bold text-green-400">Excellent</span>
                 </div>
              </div>
           </div>
           
           <div className="space-y-2">
              <p className="text-[9px] text-slate-500 leading-tight">
                This node is encrypted via PharmaGuard RSA. Any physical tampering triggers instant data erasure and law enforcement alert.
              </p>
              <button className="w-full bg-blue-600 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors">
                 Full Telemetry Report
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

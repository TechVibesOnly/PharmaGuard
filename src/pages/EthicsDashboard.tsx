import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Globe, Leaf, Users, Shield, TrendingUp, 
  MapPin, Plus, Share2, Download, Filter, 
  Search, CheckCircle2, AlertCircle, FileText, 
  ArrowRight, Award, Zap
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis 
} from 'recharts';
import confetti from 'canvas-confetti';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../lib/utils';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const sustainabilityData = [
  { name: 'EV Delivery', value: 75, color: '#10B981' },
  { name: 'Manual/ICE', value: 25, color: '#94A3B8' },
];

const impactRegions = [
  { id: 1, name: 'Rural Outreach A', x: 200, y: 150, deliveries: 1240, status: 'served' },
  { id: 2, name: 'Community Hub B', x: 450, y: 300, deliveries: 850, status: 'active' },
  { id: 3, name: 'Remote Village C', x: 600, y: 100, deliveries: 420, status: 'underserved' },
];

export default function EthicsDashboard() {
  const [impactData, setImpactData] = useState<any>({
    subsidizedDeliveries: 12450,
    evKm: 85200,
    regionsServed: 42,
    carbonSaved: 15.4
  });
  const [partners, setPartners] = useState<any[]>([]);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [equitySlider, setEquitySlider] = useState(65);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'partners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      await addDoc(collection(db, 'partners'), {
        name: "EcoPharma Global",
        type: "NGO",
        location: "Geneva, CH",
        impactScore: 94,
        createdAt: serverTimestamp()
      });
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#FFD700']
      });
      setShowPartnerForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header with Rising Counters */}
       <header className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactMetric 
             label="Subsidized Deliveries" 
             value={impactData.subsidizedDeliveries} 
             suffix="+" 
             icon={Heart} 
             color="text-pink-500" 
             bgColor="bg-pink-50"
          />
          <ImpactMetric 
             label="Fleet Distance (EV)" 
             value={impactData.evKm} 
             suffix="km" 
             icon={Zap} 
             color="text-blue-500" 
             bgColor="bg-blue-50"
          />
          <ImpactMetric 
             label="Unique Regions Served" 
             value={impactData.regionsServed} 
             icon={Globe} 
             color="text-indigo-500" 
             bgColor="bg-indigo-50"
          />
          <ImpactMetric 
             label="Carbon Offset (Metric Tons)" 
             value={impactData.carbonSaved} 
             icon={Leaf} 
             color="text-green-500" 
             bgColor="bg-green-50"
             decimals={1}
          />
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Equity Map */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Social Equity Map</h2>
                   <p className="text-sm text-slate-500 font-medium">Real-time geographic distribution of subsidized routes</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex space-x-1">
                   <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900">Reach</button>
                   <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Demand</button>
                </div>
             </div>

             <div className="relative h-[400px] w-full bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden shadow-inner group">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
                   {/* World Contours Simulation */}
                   <path 
                      d="M 50 100 Q 150 50 250 120 T 450 80 T 750 150 V 350 H 50 Z" 
                      fill="#F1F5F9" 
                   />
                   
                   {impactRegions.map((region) => (
                     <React.Fragment key={region.id}>
                       {/* Ripple Effect */}
                       <motion.circle
                          cx={region.x}
                          cy={region.y}
                          r={20}
                          fill={region.status === 'underserved' ? '#EF4444' : '#10B981'}
                          initial={{ scale: 0, opacity: 0.5 }}
                          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, delay: region.id * 0.5 }}
                       />
                       <motion.g
                          whileHover={{ scale: 1.2 }}
                          className="cursor-pointer"
                       >
                          <circle cx={region.x} cy={region.y} r="6" fill={region.status === 'underserved' ? '#EF4444' : '#10B981'} />
                          <circle cx={region.x} cy={region.y} r="10" fill="transparent" stroke={region.status === 'underserved' ? '#EF4444' : '#10B981'} strokeWidth="1" />
                       </motion.g>
                     </React.Fragment>
                   ))}
                </svg>

                {/* Floating UI on Map */}
                <div className="absolute top-8 left-8">
                   <GlassCard className="p-4 bg-slate-900/40 text-white border-white/10 backdrop-blur-xl">
                      <div className="flex items-center space-x-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Active Influence</span>
                      </div>
                      <p className="text-xs font-medium text-slate-300">Sholapur-like rural segments are now <strong>84% served</strong>.</p>
                   </GlassCard>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Equity Distribution Strategy</h3>
                   <span className="text-lg font-black text-blue-600">{equitySlider}% Target</span>
                </div>
                <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={equitySlider}
                   onChange={(e) => setEquitySlider(Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 mb-6"
                />
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  * Adjusting the slider re-weights the AI routing engine to prioritize loss-leading rural routes over profitable urban segments.
                </p>
             </div>
          </div>

          {/* Right Column: Partners & Sustainability */}
          <div className="lg:col-span-4 space-y-8">
             <GlassCard className="p-8 border-none shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center space-x-3 mb-6">
                      <Leaf className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">ESG Score</h3>
                   </div>
                   
                   <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={sustainabilityData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                               roundedCorners
                            >
                               {sustainabilityData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black text-slate-900">75%</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase">Green Logistics</span>
                      </div>
                   </div>

                   <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="font-bold text-slate-500">Recyclable Packaging</span>
                         <span className="font-black text-slate-900">92%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-indigo-500" />
                      </div>
                   </div>
                </div>
             </GlassCard>

             <section>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Key Stakeholders</h3>
                   <button 
                     onClick={() => setShowPartnerForm(true)}
                     className="text-blue-600 hover:text-blue-700 transition-colors"
                   >
                      <Plus className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="space-y-4">
                   {partners.map((partner, i) => (
                     <motion.div 
                        key={partner.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors cursor-pointer shadow-lg shadow-slate-200/50"
                     >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Users className="w-5 h-5 text-slate-400" />
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900">{partner.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{partner.type} • {partner.location}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black text-green-600">{partner.impactScore}%</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </section>
          </div>
       </div>

       {/* Audit Logs / Navigation Section */}
       <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                   <Shield className="w-6 h-6 text-blue-400" />
                   <h2 className="text-2xl font-black tracking-tight">Compliance Audit Trail</h2>
                </div>
                <div className="space-y-4">
                   {[1, 2, 3].map((log) => (
                     <div key={log} className="flex space-x-4 items-start border-l border-white/10 pl-6 relative">
                        <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">May 01, 2026 • 14:00</p>
                           <p className="text-sm font-bold text-slate-200">System baseline audit completed — 0 discrepancies found.</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="mt-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                   <span>View Full Blockchain Ledger</span>
                   <ArrowRight className="w-4 h-4" />
                </button>
             </div>
             <div className="absolute bottom-0 right-0 opacity-10 blur-2xl">
                <TrendingUp className="w-64 h-64 text-white" />
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Platform Navigation</h3>
             <ul className="grid grid-cols-2 gap-4">
                <NavModule to="/trace" label="Blockchain Trace" description="Transparency" icon={Shield} />
                <NavModule to="/routes" label="AI Routing" description="Optimization" icon={Zap} />
                <NavModule to="/subscriptions" label="Subscribers" description="Sustainability" icon={Users} />
                <NavModule to="/iot-monitoring" label="IoT Dashboard" description="Quality Control" icon={Activity} />
             </ul>
          </div>
       </section>

       {/* Partner Modal */}
       <AnimatePresence>
          {showPartnerForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-24">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowPartnerForm(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
               >
                  <form onSubmit={handlePartnerSubmit} className="p-10 space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New NGO Partner</h2>
                        <button type="button" onClick={() => setShowPartnerForm(false)} className="text-slate-400">✕</button>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="space-y-1 relative group">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">NGO Name</label>
                           <input 
                              type="text" 
                              required
                              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                              placeholder="e.g. World Health Aid"
                           />
                           <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-0 group-focus-within:w-full transition-all duration-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1 relative group">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Region</label>
                              <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                 <option>Global South</option>
                                 <option>Continental Europe</option>
                                 <option>Emerging Asia</option>
                              </select>
                           </div>
                           <div className="space-y-1 relative group">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Focus</label>
                              <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                 <option>Subsidized Care</option>
                                 <option>Environmental</option>
                                 <option>Innovation</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:bg-slate-300"
                     >
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Onboard Partner</span>
                     </button>
                  </form>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}

function ImpactMetric({ label, value, suffix = "", icon: Icon, color, bgColor, decimals = 0 }: any) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(progress * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <GlassCard className="p-6 border-none shadow-xl hover:translate-y-[-4px] transition-transform">
       <div className={cn("p-2 rounded-xl inline-block mb-4", bgColor)}>
          <Icon className={cn("w-5 h-5", color)} />
       </div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black text-slate-900">
         {displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
         {suffix}
       </p>
    </GlassCard>
  );
}

function NavModule({ to, label, description, icon: Icon }: any) {
  return (
    <motion.li 
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2rem] border border-slate-100 p-4 flex flex-col items-center text-center group cursor-pointer hover:border-blue-200 transition-colors shadow-lg shadow-slate-200/50"
      onClick={() => window.location.href = to}
    >
       <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
       </div>
       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</p>
       <p className="text-[9px] font-bold text-slate-400 uppercase">{description}</p>
    </motion.li>
  );
}

function Activity(props: any) {
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
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

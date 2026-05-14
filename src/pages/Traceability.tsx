import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, History, MapPin, QrCode, Share2, 
  ChevronRight, ExternalLink, Activity, CheckCircle2, 
  AlertTriangle, Fingerprint, Box, ArrowRight, Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, GradientTexture, PresentationControls } from '@react-three/drei';
import { cn } from '../lib/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// 3D Pill Model Component
function PillModel() {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Top half */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#007BFF" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Bottom half */}
      <mesh position={[0, -0.6, 0]}>
        <capsuleGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>
    </group>
  );
}

const mockBatches = [
  {
    id: "B-8829-QX",
    drugName: "Insulin Glargine 100u",
    hash: "0x7d...f3a9",
    verified: true,
    journey: [
      { step: "Manufacturing", location: "Berlin Biotech Hub", timestamp: "2026-04-10T08:00:00Z", sig: "verified_mfr_sig" },
      { step: "Customs Clearance", location: "Frankfurt Airport", timestamp: "2026-04-12T14:30:00Z", sig: "verified_customs_sig" },
      { step: "Distribution", location: "Central Pharma Logistics", timestamp: "2026-04-15T10:15:00Z", sig: "verified_dist_sig" },
      { step: "In Transit", location: "Cold Chain Express", timestamp: "2026-04-20T09:45:00Z", sig: "active_iot_track" }
    ]
  }
];

export default function Traceability() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'batches'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBatches(data.length > 0 ? data : mockBatches);
    });
    return () => unsubscribe();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSelectedBatch(batches[0]);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Impact Ticker */}
      <div className="bg-blue-600 overflow-hidden py-2 whitespace-nowrap relative">
         <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="inline-block"
         >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-white text-[10px] font-bold uppercase tracking-widest px-8">
                Combats counterfeits — 10M fakes blocked globally • AI-Powered Traceability • Real-time Immutable Ledger
              </span>
            ))}
         </motion.div>
         <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-blue-600 to-transparent z-10" />
         <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-600 to-transparent z-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Explorer */}
        <div className="lg:col-span-5 space-y-6">
           <section>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Drug Traceability</h1>
              <p className="text-slate-500 font-medium italic">Public transparency ledger powered by Polygon Blockchain</p>
           </section>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleScan}
                className="group relative h-40 bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center space-y-3 transition-all hover:scale-[0.98] active:scale-95 shadow-xl shadow-slate-900/20"
              >
                 <div className="relative">
                    <QrCode className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                    {isScanning && (
                      <motion.div 
                        animate={{ top: ["-10%", "110%", "-10%"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                      />
                    )}
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-widest">Scan QR Code</span>
                 
                 {/* Shimmer Effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>

              <button 
                onClick={() => setShowQR(!showQR)}
                className="group h-40 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center space-y-3 transition-all hover:border-blue-200 shadow-xl shadow-slate-200/50"
              >
                 <Fingerprint className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Verify ID</span>
              </button>
           </div>

           <section className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Batches</h3>
                 <History className="w-4 h-4 text-slate-300" />
              </div>
              <div className="space-y-3">
                 {batches.map((batch) => (
                   <div 
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={cn(
                      "p-4 rounded-3xl border transition-all cursor-pointer group",
                      selectedBatch?.id === batch.id ? "bg-blue-600 border-transparent text-white" : "bg-white border-slate-100 hover:border-blue-200"
                    )}
                   >
                      <div className="flex justify-between items-center">
                         <div className="flex items-center space-x-3">
                            <Box className={cn("w-5 h-5", selectedBatch?.id === batch.id ? "text-blue-200" : "text-blue-500")} />
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Batch #{batch.id}</p>
                               <p className="text-sm font-bold">{batch.drugName}</p>
                            </div>
                         </div>
                         <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:col-span-7">
           <AnimatePresence mode="wait">
              {selectedBatch ? (
                <motion.div
                  key={selectedBatch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                   <GlassCard className="p-8 border-none shadow-2xl relative overflow-hidden">
                      <div className="flex justify-between items-start relative z-10">
                         <div>
                            <div className="flex items-center space-x-2 mb-2">
                               <ShieldCheck className="w-5 h-5 text-green-500" />
                               <span className="text-xs font-black text-green-600 uppercase tracking-widest">Immutable Record Verified</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedBatch.drugName}</h2>
                            <p className="text-slate-500 text-sm mt-1 font-mono tracking-tight">{selectedBatch.hash}</p>
                         </div>
                         <div className="h-24 w-24">
                           <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                             <ambientLight intensity={0.5} />
                             <pointLight position={[10, 10, 10]} />
                             <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
                               <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                                 <Suspense fallback={null}>
                                   <PillModel />
                                 </Suspense>
                               </Float>
                             </PresentationControls>
                           </Canvas>
                         </div>
                      </div>

                      {/* Journey Timeline */}
                      <div className="mt-12 space-y-8 relative">
                         <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
                         
                         {selectedBatch.journey.map((step: any, i: number) => (
                           <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex space-x-6 group"
                           >
                              <div className="relative">
                                 <div className={cn(
                                   "w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-lg",
                                   i === 0 ? "bg-slate-900 text-white" : "bg-white border-2 border-slate-100 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500"
                                 )}>
                                    {i === selectedBatch.journey.length - 1 ? <Activity className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                 </div>
                                 {i < selectedBatch.journey.length - 1 && (
                                   <motion.div 
                                      initial={{ height: 0 }}
                                      animate={{ height: "100%" }}
                                      transition={{ duration: 1, delay: i * 0.2 }}
                                      className="absolute left-1/2 top-12 w-0.5 bg-blue-500 translate-x-[-50%]" 
                                   />
                                 )}
                              </div>
                              <div className="pt-2 pb-6 flex-1 border-b border-slate-50 last:border-0">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h4 className="font-black text-slate-800 text-sm">{step.step}</h4>
                                       <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                                          <MapPin className="w-3 h-3 mr-1" /> {step.location}
                                       </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{new Date(step.timestamp).toLocaleDateString()}</span>
                                 </div>
                                 
                                 <div className="mt-3 flex items-center space-x-3">
                                    <div className="px-2 py-0.5 bg-slate-50 rounded text-[9px] font-mono text-slate-400 truncate max-w-[150px]">
                                       SIG: {step.sig}
                                    </div>
                                    <div className="text-[10px] font-bold text-green-600 flex items-center">
                                       <ShieldCheck className="w-3 h-3 mr-1" /> Valid
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                         ))}
                      </div>

                      <div className="mt-12 flex space-x-4">
                         <button className="flex-1 bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                            <Share2 className="w-4 h-4" />
                            <span>Share Tracking Link</span>
                         </button>
                         <button className="px-6 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <ExternalLink className="w-5 h-5 text-slate-400" />
                         </button>
                      </div>
                   </GlassCard>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center space-x-4">
                         <AlertTriangle className="w-6 h-6 text-amber-500" />
                         <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Tamper Detection</p>
                            <p className="text-xs font-bold text-amber-800">Seal integrity verified via IoT</p>
                         </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-center space-x-4">
                         <Activity className="w-6 h-6 text-blue-500" />
                         <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Storage Monitoring</p>
                            <p className="text-xs font-bold text-blue-800">No thermal excursions found</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-6 text-center">
                   <div className="relative">
                      <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                         <ShieldCheck className="w-16 h-16 text-blue-200" />
                      </div>
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20" />
                   </div>
                   <div className="max-w-sm">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Select a Batch to Verify</h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Input a tracking ID or use the visual explorer to view the immutable journey of your medication.
                      </p>
                   </div>
                   <button 
                    onClick={handleScan}
                    className="flex items-center space-x-2 text-blue-600 font-black uppercase tracking-widest text-xs group"
                   >
                      <span>Quick scan demo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

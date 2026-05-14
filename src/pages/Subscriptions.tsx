import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, Home, Globe, CheckCircle2, ChevronRight, 
  CreditCard, Calendar, Clock, ArrowRight, ShieldCheck,
  Zap, Star, Users, Calculator, Info, Printer, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const tiers = [
  {
    id: 'priority',
    name: 'Priority Pass',
    price: 29,
    description: 'Ultra-fast delivery for critical medications',
    features: ['Top of Queue Priority', 'Rocket Dispatch', '24/7 Concierge', '5 Priority Slots'],
    color: 'bg-blue-600',
    icon: Rocket,
    benefits: 'Bypasses standard fulfillment latencies using AI-optimized hot-lanes.'
  },
  {
    id: 'home',
    name: 'Home Harmony',
    price: 15,
    description: 'Perfect for monthly chronic prescriptions',
    features: ['Auto-Refill Scheduling', 'Predictive restocking', 'Smart Lock Dropoff', 'Standard Priority'],
    color: 'bg-indigo-600',
    icon: Home,
    benefits: 'Synced with your wearable data to predict when you run low.'
  },
  {
    id: 'enterprise',
    name: 'Eco-System',
    price: 99,
    description: 'For clinics and community pharmacies',
    features: ['Unlimited Slots', 'White-label tracking', 'Bulk Blockchain minting', 'IoT integration'],
    color: 'bg-slate-900',
    icon: Globe,
    benefits: 'Full supply chain visibility with carbon-offset auditing.'
  }
];

export default function Subscriptions() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userSub, setUserSub] = useState<any>(null);
  const [subsidizedIncome, setSubsidizedIncome] = useState(45000);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'subs'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserSub(docs[0] || null);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await addDoc(collection(db, 'subs'), {
        userId: auth.currentUser?.uid,
        plan: selectedTier.id,
        status: 'active',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        prioritySlots: selectedTier.id === 'priority' ? 5 : selectedTier.id === 'enterprise' ? 999 : 1,
        createdAt: serverTimestamp()
      });
      
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
      });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubsidy = (income: number) => {
    if (income < 20000) return 90;
    if (income < 35000) return 50;
    if (income < 50000) return 20;
    return 0;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      alert("Subscription Invoice Generated (Simulation)");
    }, 1500);
  };

  return (
    <div className={cn("space-y-12 pb-20 transition-opacity duration-500", isPrinting && "opacity-30")}>
      {/* Header with Stats */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Tiers</h1>
          <p className="text-slate-500 font-medium">Sustainable healthcare access for everyone, everywhere.</p>
        </div>
        <div className="flex items-center space-x-3">
           <GlassCard className="px-4 py-2 flex items-center space-x-2 border-green-100 bg-green-50">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-widest">PCI-DSS Secure</span>
           </GlassCard>
        </div>
      </section>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center max-w-2xl mx-auto">
         {[1, 2, 3].map((s) => (
           <React.Fragment key={s}>
             <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step >= s ? "bg-blue-600 border-blue-600 text-white scale-110" : "bg-white border-slate-200 text-slate-400"
                )}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest mt-2",
                  step >= s ? "text-blue-600" : "text-slate-400"
                )}>
                  {s === 1 ? 'Choose' : s === 2 ? 'Checkout' : 'Active'}
                </span>
             </div>
             {s < 3 && (
               <div className="flex-1 px-4 mb-4">
                  <div className="h-1 bg-slate-100 rounded-full relative overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: step > s ? "100%" : "0%" }}
                        className="absolute inset-0 bg-blue-600"
                     />
                  </div>
               </div>
             )}
           </React.Fragment>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="tiers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {tiers.map((tier) => (
              <PricingCard 
                key={tier.id} 
                tier={tier} 
                onSelect={() => {
                  setSelectedTier(tier);
                  setStep(2);
                }} 
              />
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
             key="checkout"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.05 }}
             className="max-w-4xl mx-auto"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-8 border-none shadow-2xl">
                   <h3 className="text-xl font-black text-slate-900 mb-6">Secure Checkout</h3>
                   <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                         <div className="p-3 bg-white rounded-xl shadow-sm">
                            <selectedTier.icon className={cn("w-6 h-6", selectedTier.color.replace('bg-', 'text-'))} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800">{selectedTier.name}</p>
                            <p className="text-xs text-slate-500">${selectedTier.price}/mo billed monthly</p>
                         </div>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <div className="relative">
                           <input type="text" placeholder="Card Number" className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                           <CreditCard className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                           <input type="text" placeholder="CVC" className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>

                      <button 
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:bg-slate-300"
                      >
                         {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                         <span>Complete Activation</span>
                      </button>
                      <button onClick={() => setStep(1)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 hover:text-slate-600">Back to selection</button>
                   </div>
                </GlassCard>

                <div className="space-y-6">
                   <GlassCard className="p-6 bg-slate-900 border-none text-white overflow-hidden relative">
                      <div className="relative z-10">
                         <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Summary</h4>
                         <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-400">Monthly Tier</span>
                               <span className="font-bold">${selectedTier.price}.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-400">Priority Setup</span>
                               <span className="text-green-400 font-bold">FREE</span>
                            </div>
                         </div>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Billed Today</p>
                               <p className="text-3xl font-black">${selectedTier.price}.00</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl">
                               <Zap className="w-6 h-6 text-amber-400" />
                            </div>
                         </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full translate-x-1/2 translate-y-[-1/2]" />
                   </GlassCard>

                   <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl flex items-start space-x-4">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed font-medium">
                         Your first <strong>rocket dispatch</strong> is enabled immediately after checkout. IoT sensors will be prioritized for your shipments.
                      </p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                   <ShieldCheck className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to Priority Care</h2>
                <p className="text-slate-500 max-w-sm mt-2">Your subscription is active. Your deliveries now occupy the top-tier scheduling queue.</p>
             </div>

             <div className="grid grid-cols-2 gap-4 text-left">
                <GlassCard className="p-5 border-none shadow-lg">
                   <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Billing</p>
                   <p className="text-sm font-bold text-slate-800">May 30, 2026</p>
                </GlassCard>
                <GlassCard className="p-5 border-none shadow-lg">
                   <Star className="w-5 h-5 text-amber-500 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                   <p className="text-sm font-bold text-slate-800">Premium Active</p>
                </GlassCard>
             </div>

             <div className="flex space-x-4">
                <button 
                  onClick={handlePrint}
                  className="flex-1 bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                >
                   <Printer className="w-4 h-4" />
                   <span>Download Invoice</span>
                </button>
                <button className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-2xl py-4 flex items-center justify-center space-x-3 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
                   <Download className="w-4 h-4" />
                   <span>Access Digital Pass</span>
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subsidized Scale Calculator */}
      <section className="pt-12 border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div>
              <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-pink-100 rounded-xl">
                    <Heart className="w-5 h-5 text-pink-600" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Equity Tier Calculator</h2>
              </div>
              <p className="text-slate-500 leading-relaxed mb-8">
                 We believe life-saving medicine should be accessible regardless of circumstance. Use our sliding scale to check if you qualify for a subsidized <strong>Home Harmony</strong> tier.
              </p>
              
              <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Annual Household Income</label>
                    <span className="text-lg font-black text-blue-600">${subsidizedIncome.toLocaleString()}</span>
                 </div>
                 <input 
                    type="range" 
                    min="10000" 
                    max="100000" 
                    step="1000"
                    value={subsidizedIncome}
                    onChange={(e) => setSubsidizedIncome(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>$10k</span>
                    <span>$100k+</span>
                 </div>

                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Subsidy</p>
                       <p className="text-3xl font-black text-green-600">{calculateSubsidy(subsidizedIncome)}%</p>
                    </div>
                    {subsidizedIncome < 50000 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center"
                      >
                         <CheckCircle2 className="w-3 h-3 mr-1" /> Qualified
                      </motion.div>
                    )}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Subsidized Pharma', count: '1.2M+', icon: Users, color: 'text-pink-500' },
                { label: 'Rural Reach', count: '84%', icon: Globe, color: 'text-blue-500' },
                { label: 'Price Savings', count: '$24M', icon: Calculator, color: 'text-green-500' },
                { label: 'Response Time', count: '-45%', icon: Clock, color: 'text-amber-500' },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-6 border-none shadow-lg hover:translate-y-[-4px] transition-transform">
                   <div className="p-2 bg-white rounded-lg inline-block shadow-sm mb-3">
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-900">{stat.count}</p>
                </GlassCard>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}

function PricingCard({ tier, onSelect }: any) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[480px] w-full perspective-1000 group cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onSelect}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d shadow-2xl rounded-[3rem]"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] p-8 border border-slate-100 flex flex-col items-center text-center">
           <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl", tier.color)}>
              <tier.icon className="w-10 h-10 text-white" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{tier.name}</h3>
           <p className="text-slate-500 text-sm mb-8">{tier.description}</p>
           
           <div className="flex items-baseline space-x-1 mb-8">
              <span className="text-4xl font-black text-slate-900">${tier.price}</span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">/ month</span>
           </div>

           <div className="space-y-3 w-full">
              {tier.features.slice(0, 3).map((f: string, i: number) => (
                <div key={i} className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-600">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <span>{f}</span>
                </div>
              ))}
           </div>

           <div className="mt-auto pt-6 w-full flex items-center justify-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Benefits</span>
              <ChevronRight className="w-4 h-4" />
           </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-slate-900 text-white rounded-[3rem] p-8 flex flex-col justify-between [transform:rotateY(180deg)]">
           <div className="space-y-6">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-white/10 rounded-xl">
                    <Activity className="w-5 h-5 text-blue-400" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest">Key Impact</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic">"{tier.benefits}"</p>
              
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Included Advantages</p>
                 {tier.features.map((f: string, i: number) => (
                   <div key={i} className="flex items-center space-x-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-200">{f}</span>
                   </div>
                 ))}
              </div>
           </div>

           <button className="w-full bg-white text-slate-900 rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all flex items-center justify-center space-x-2">
              <span>Select this tier</span>
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function Heart(props: any) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

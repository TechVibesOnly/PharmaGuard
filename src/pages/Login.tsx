import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Pill, ShieldCheck, Heart, Truck } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

export default function Login() {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Default new login as pharmacy for demo purposes, or prompt for role
        // In a real app, this would be a registration flow
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          role: 'admin', // First user is admin for demo
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#007BFF15,transparent_50%),radial-gradient(circle_at_bottom_left,#28A74515,transparent_50%)]" />
      
      <GlassCard className="max-w-md w-full relative">
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40"
          >
            <Pill className="text-white w-8 h-8" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PharmaGuard</h1>
            <p className="text-slate-500 font-medium italic">Ethical Last-Mile Delivery</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-[10px] uppercase font-bold text-blue-600">Temp Secure</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-green-50 border border-green-100">
              <Truck className="w-5 h-5 text-green-600 mb-1" />
              <span className="text-[10px] uppercase font-bold text-green-600">EV Fleet</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
          >
            Continue with Medical Portal
          </button>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Supporting 1,200+ Subsidized Deliveries</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

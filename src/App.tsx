import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IotMonitoring from './pages/IotMonitoring';
import RouteOptimization from './pages/RouteOptimization';
import Traceability from './pages/Traceability';
import Subscriptions from './pages/Subscriptions';
import EthicsDashboard from './pages/EthicsDashboard';
import { Skeleton } from './components/ui/GlassCard';
import { db } from './lib/firebase';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [seeding, setSeeding] = useState(false);

  // Mock data seeder for first run
  useEffect(() => {
    async function seedInitialData() {
      if (user && !loading && profile?.role === 'admin') {
        const deliveriesCol = collection(db, 'deliveries');
        const dSnap = await getDocs(query(deliveriesCol, limit(1)));
        
        const devicesCol = collection(db, 'devices');
        const devSnap = await getDocs(query(devicesCol, limit(1)));

        const routesCol = collection(db, 'routes');
        const rSnap = await getDocs(query(routesCol, limit(1)));

        const batchesCol = collection(db, 'batches');
        const bSnap = await getDocs(query(batchesCol, limit(1)));
        
        if (dSnap.empty && !seeding) {
          setSeeding(true);
          console.log("Seeding deliveries...");
          const mockDeliveries = [
            { patientName: 'Alice Johnson', status: 'delivered', temperatureCurrent: 4.2, temperatureMin: 2, temperatureMax: 8, isEv: true },
            { patientName: 'Bob Smith', status: 'in-transit', temperatureCurrent: 5.1, temperatureMin: 2, temperatureMax: 8, isEv: true },
            { patientName: 'Charlie Davis', status: 'pending', temperatureCurrent: 4.8, temperatureMin: 2, temperatureMax: 8, isEv: false },
            { patientName: 'Dana Lee', status: 'delivered', temperatureCurrent: 3.9, temperatureMin: 2, temperatureMax: 8, isEv: true },
            { patientName: 'Eve White', status: 'picked-up', temperatureCurrent: 4.5, temperatureMin: 2, temperatureMax: 8, isEv: true },
          ];

          for (const d of mockDeliveries) {
            await addDoc(deliveriesCol, {
              ...d,
              pharmacyId: user.uid,
              patientId: 'patient-' + Math.random().toString(36).substr(2, 5),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }

        if (devSnap.empty && !seeding) {
          setSeeding(true);
          console.log("Seeding IoT devices...");
          const mockDevices = [
            { type: 'storage', temp: 4.2, humidity: 45, status: 'online', gps: { lat: 0, lng: 0 } },
            { type: 'transport', temp: 5.5, humidity: 48, status: 'online', gps: { lat: 1, lng: 1 } },
            { type: 'storage', temp: 9.1, humidity: 52, status: 'alert', gps: { lat: 2, lng: 2 } }, 
          ];

          for (const dev of mockDevices) {
            await addDoc(devicesCol, {
              ...dev,
              lastSeen: new Date().toISOString()
            });
          }
        }

        if (rSnap.empty && !seeding) {
           setSeeding(true);
           console.log("Seeding routes...");
           const mockRoutes = [
             { origin: "City Center Pharma", destination: "Hillcrest Clinic", eta: "15:30", fuelSavings: 28, carbonOffset: 15, isRural: false },
             { origin: "Main Hospital", destination: "Remote Outpost A", eta: "17:15", fuelSavings: 42, carbonOffset: 22, isRural: true }
           ];
           for (const r of mockRoutes) {
             await addDoc(routesCol, {
               ...r,
               createdAt: new Date().toISOString()
             });
           }
           setSeeding(false);
        }

        if (bSnap.empty && !seeding) {
           setSeeding(true);
           console.log("Seeding batches...");
           const mockBatches = [
             {
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
           for (const b of mockBatches) {
             await addDoc(batchesCol, b);
           }
           setSeeding(false);
        }

        const subsCol = collection(db, 'subs');
        const sSnap = await getDocs(query(subsCol, limit(1)));
        if (sSnap.empty && !seeding && auth.currentUser) {
           setSeeding(true);
           await addDoc(subsCol, {
             userId: auth.currentUser.uid,
             plan: 'priority',
             status: 'active',
             nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
             prioritySlots: 5,
             createdAt: new Date().toISOString()
           });
           setSeeding(false);
        }

        const partnersCol = collection(db, 'partners');
        const pSnap = await getDocs(query(partnersCol, limit(1)));
        if (pSnap.empty && !seeding) {
           setSeeding(true);
           const mockPartners = [
              { name: "Global Health Alliance", type: "NGO", location: "Nairobi, KE", impactScore: 92 },
              { name: "Rural Med Reach", type: "NGO", location: "Mumbai, IN", impactScore: 88 }
           ];
           for (const p of mockPartners) {
              await addDoc(partnersCol, { ...p, createdAt: new Date().toISOString() });
           }
           setSeeding(false);
        }
      }
    }
    seedInitialData();
  }, [user, loading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-10">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/iot-monitoring" element={user ? <Dashboard><IotMonitoring /></Dashboard> : <Navigate to="/login" />} />
      <Route path="/routes" element={user ? <Dashboard><RouteOptimization /></Dashboard> : <Navigate to="/login" />} />
      <Route path="/trace" element={user ? <Dashboard><Traceability /></Dashboard> : <Navigate to="/login" />} />
      <Route path="/subscriptions" element={user ? <Dashboard><Subscriptions /></Dashboard> : <Navigate to="/login" />} />
      <Route path="/ethics" element={user ? <Dashboard><EthicsDashboard /></Dashboard> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

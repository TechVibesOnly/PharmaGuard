import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Package, TrendingUp, Thermometer, MapPin, Search, 
  Bell, Settings, LogOut, ChevronRight, Leaf, Heart, LayoutDashboard,
  Truck, Activity, Globe, Navigation, ShieldCheck, CreditCard
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { GlassCard, Pulse } from '../components/ui/GlassCard';
import { formatCurrency } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

// ... existing data consts ...

export default function Dashboard({ children }: { children?: React.ReactNode }) {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliveries(docs);
      
      const latest = docs[0];
      if (latest && latest.status === 'delivered' && location.pathname === '/') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-20"
      >
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">PharmaGuard</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem to="/" icon={LayoutDashboard} label="Overview" active={location.pathname === '/'} />
          <SidebarItem to="/iot-monitoring" icon={Activity} label="IoT Monitoring" active={location.pathname === '/iot-monitoring'} glow />
          <SidebarItem to="/routes" icon={Navigation} label="AI Routes" active={location.pathname === '/routes'} glow />
          <SidebarItem to="/trace" icon={ShieldCheck} label="Blockchain Trace" active={location.pathname === '/trace'} glow />
          <SidebarItem to="/subscriptions" icon={CreditCard} label="Subscriptions" active={location.pathname === '/subscriptions'} glow />
          <SidebarItem to="/ethics" icon={Heart} label="Ethical Focus" active={location.pathname === '/ethics'} glow />
          <SidebarItem to="#" icon={Package} label="Deliveries" />
          <SidebarItem to="#" icon={Truck} label="EV Fleet" />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <SidebarItem to="#" icon={Settings} label="Settings" />
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center space-x-3 text-slate-500 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Bar Common */}
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1 italic">
                {location.pathname === '/iot-monitoring' ? 'Thermal Telemetry' : 'Mission Control'}
              </h2>
              <h1 className="text-3xl font-bold text-slate-900">
                {location.pathname === '/iot-monitoring' ? 'IoT System Status' : `Welcome Back, ${profile?.name || 'Admin'}`}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Global search..."
                  className="bg-white border-none rounded-full px-5 py-2.5 w-64 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none pl-12" 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              <motion.button 
                whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all relative"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </motion.button>
            </div>
          </header>

          {children || (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Deliveries" value="1,280" change="+12%" icon={Package} color="blue" delay={0} />
                <StatCard label="Active Routes" value="42" change="8 Pulse" icon={MapPin} color="indigo" delay={0.1} isLive />
                <StatCard label="ESG Savings" value="4.2 Tons" change="+18%" icon={Leaf} color="green" delay={0.2} />
                <StatCard label="Subsidized" value="156" change="+24" icon={Heart} color="red" delay={0.3} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <GlassCard className="lg:col-span-2 min-h-[400px]" delay={0.4}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Operational Revenue</h3>
                      <p className="text-sm text-slate-500">Weekly subscription & volume tracking</p>
                    </div>
                    <Link to="/subscriptions" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center">
                       Manage Tiers <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#007BFF" strokeWidth={3} dot={{ r: 4, fill: '#007BFF', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard delay={0.5}>
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Sustainability Ratio</h3>
                  <div className="h-64 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={impactData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {impactData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Leaf className="text-green-500 w-8 h-8 mb-1" />
                      <span className="text-2xl font-bold text-slate-800">75%</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Table */}
              <GlassCard delay={0.6}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Critical Deliveries</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 italic text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="pb-4 font-medium pl-4">ID</th>
                        <th className="pb-4 font-medium">Patient</th>
                        <th className="pb-4 font-medium">Temp Range</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium text-right pr-4">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {deliveries.map((d) => (
                        <tr key={d.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 pl-4"><span className="text-xs font-mono font-bold text-slate-400">#PG-{d.id.slice(0, 5)}</span></td>
                          <td className="py-4 text-sm font-semibold">{d.patientName}</td>
                          <td className="py-4 text-sm">{d.temperatureCurrent}°C</td>
                          <td className="py-4"><StatusBadge status={d.status} /></td>
                          <td className="py-4 text-right pr-4 text-xs text-slate-400">{new Date(d.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </main>

      {/* Floating Impact Counter */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-white/20 backdrop-blur-lg z-30"
      >
        <Heart className="w-6 h-6 text-red-400 fill-red-400 animate-pulse" />
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Subsidized Deliveries</p>
          <p className="text-xl font-bold">1,242</p>
        </div>
      </motion.div>
    </div>
  );
}

function SidebarItem({ to, icon: Icon, label, active = false, glow = false }: any) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center space-x-3 w-full p-3 rounded-xl transition-all group relative overflow-hidden",
        active ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" : "text-slate-500 hover:bg-slate-50 hover:translate-x-1",
        glow && !active && "hover:bg-blue-600 hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500", glow && !active && "group-hover:text-white")} />
      <span className="font-semibold">{label}</span>
      {glow && !active && (
        <span className="absolute inset-0 bg-blue-600/10 animate-pulse pointer-events-none" />
      )}
    </Link>
  );
}

// ... rest of the existing helper components ...
function StatCard({ label, value, change, icon: Icon, color, delay, isLive }: any) {
  const colors: any = { blue: 'bg-blue-500', green: 'bg-green-500', indigo: 'bg-indigo-500', red: 'bg-red-500' };
  return (
    <GlassCard delay={delay} className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-lg text-white", colors[color])}><Icon className="w-5 h-5" /></div>
        {isLive && <Pulse />}
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline space-x-2 mt-1">
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-green-600 bg-green-50">{change}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'picked-up': 'bg-blue-100 text-blue-700 border-blue-200',
    'in-transit': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200'
  };
  return <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", styles[status] || styles.pending)}>{status}</span>;
}

const revenueData = [ { name: 'Mon', revenue: 2400 }, { name: 'Tue', revenue: 1398 }, { name: 'Wed', revenue: 9800 }, { name: 'Thu', revenue: 3908 }, { name: 'Fri', revenue: 4800 }, { name: 'Sat', revenue: 3800 }, { name: 'Sun', revenue: 4300 } ];
const impactData = [ { name: 'EV Delivery', value: 75, color: '#28A745' }, { name: 'Standard', value: 25, color: '#6C757D' } ];

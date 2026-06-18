import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Car, Calendar, Users, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Link } from 'react-router-dom';

const STATUS_COLORS = { available:'#10b981', rented:'#3b82f6', maintenance:'#f59e0b', retired:'#ef4444' };

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!data) return null;

  const { metrics, monthly_revenue, vehicle_status, top_vehicles, recent_bookings } = data;

  const METRIC_CARDS = [
    { label:'Total Revenue', value:`$${metrics.total_revenue?.toLocaleString()}`, sub:`$${metrics.monthly_revenue?.toLocaleString()} this month`, icon:<DollarSign size={20}/>, color:'#3b82f6', bg:'#eff6ff' },
    { label:'Total Bookings', value:metrics.total_bookings, sub:`${metrics.pending_bookings} pending`, icon:<Calendar size={20}/>, color:'#10b981', bg:'#f0fdf4' },
    { label:'Active Rentals', value:metrics.active_bookings, sub:`${metrics.utilization_rate}% utilization`, icon:<Car size={20}/>, color:'#6366f1', bg:'#f5f3ff' },
    { label:'Total Customers', value:metrics.total_customers, sub:`${metrics.available_vehicles} vehicles available`, icon:<Users size={20}/>, color:'#f59e0b', bg:'#fffbeb' },
  ];

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontSize:'1.4rem', marginBottom:4 }}>Dashboard Overview</h2>
        <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>Real-time analytics for DriveEase operations</p>
      </div>

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {METRIC_CARDS.map((m,i) => (
          <motion.div key={m.label} className="card" style={{ padding:22 }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', color:m.color }}>{m.icon}</div>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.7rem', fontWeight:700, color:m.color, marginBottom:4 }}>{m.value}</div>
            <div style={{ fontSize:'.72rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, fontWeight:700 }}>{m.label}</div>
            <div style={{ fontSize:'.75rem', color:'var(--text2)', marginTop:4 }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'.95rem', marginBottom:20 }}>Revenue & Bookings (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly_revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{ fontSize:11 }}/>
              <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v,n)=>[n==='revenue'?`$${v.toLocaleString()}`:v, n]}/>
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" name="Revenue"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'.95rem', marginBottom:20 }}>Fleet Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={vehicle_status.map(v=>({name:v.status, value:v.count}))}
                cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {vehicle_status.map((v,i) => <Cell key={i} fill={STATUS_COLORS[v.status]||'#94a3b8'}/>)}
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Recent Bookings */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:'.95rem' }}>Recent Bookings</h3>
            <Link to="/admin/bookings" style={{ fontSize:'.78rem', color:'var(--primary)', fontWeight:600 }}>View All</Link>
          </div>
          <table className="data-table">
            <thead><tr><th>Ref</th><th>Customer</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>
              {recent_bookings.map(b => (
                <tr key={b.id}>
                  <td><span style={{ fontFamily:'var(--font-mono,monospace)', fontWeight:700, fontSize:'.8rem' }}>{b.booking_ref}</span></td>
                  <td style={{ fontSize:'.82rem' }}>{b.customer?.full_name}</td>
                  <td style={{ fontSize:'.82rem', color:'var(--text2)' }}>{b.vehicle?.name}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Vehicles */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <h3 style={{ fontSize:'.95rem' }}>Top Performing Vehicles</h3>
          </div>
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
            {top_vehicles.map(({vehicle,bookings},i) => (
              <div key={vehicle.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--text3)', width:24 }}>{i+1}</span>
                <div style={{ width:48, height:36, borderRadius:6, overflow:'hidden', background:'var(--surface2)', flexShrink:0 }}>
                  {vehicle.primary_image && <img src={vehicle.primary_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:'.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{vehicle.name}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>${vehicle.daily_rate}/day</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:700, color:'var(--primary)', fontSize:'.9rem' }}>{bookings}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--text3)' }}>bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


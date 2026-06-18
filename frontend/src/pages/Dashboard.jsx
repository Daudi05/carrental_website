import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Calendar, CreditCard, Bell, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { bookingsApi, publicApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user } = useAuth();
  const toast    = useToast();
  const [bookings, setBookings]  = useState([]);
  const [tab,      setTab]       = useState('all');
  const [loading,  setLoading]   = useState(true);

  useEffect(() => {
    bookingsApi.my().then(r => setBookings(r.data.data)).finally(() => setLoading(false));
  }, []);

  const cancel = async id => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsApi.cancel(id, { reason: 'Customer cancelled' });
      setBookings(bk => bk.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast('Booking cancelled', 'info');
    } catch (err) { toast(typeof err === 'string' ? err : 'Cancel failed', 'error'); }
  };

  const STATUS_ICON = {
    pending:   <Clock size={16} color="var(--warning)"/>,
    confirmed: <CheckCircle size={16} color="var(--success)"/>,
    active:    <Car size={16} color="var(--info)"/>,
    completed: <CheckCircle size={16} color="var(--success)"/>,
    cancelled: <XCircle size={16} color="var(--danger)"/>,
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  if (loading) return <div className="page-loader" style={{ paddingTop:'var(--nav-height)' }}><div className="spinner"/></div>;

  return (
    <div style={{ paddingTop:'var(--nav-height)', minHeight:'100vh', background:'var(--surface2)' }}>
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'28px 0' }}>
        <div className="container">
          <h1 style={{ fontSize:'1.5rem', marginBottom:4 }}>My Dashboard</h1>
          <p style={{ color:'var(--text2)' }}>Welcome back, {user?.first_name}!</p>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px 80px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            ['Total Bookings', bookings.length, Car, '#3b82f6'],
            ['Active', bookings.filter(b=>b.status==='active').length, Car, '#10b981'],
            ['Pending', bookings.filter(b=>b.status==='pending').length, Clock, '#f59e0b'],
            ['Completed', bookings.filter(b=>b.status==='completed').length, CheckCircle, '#6366f1'],
          ].map(([label,val,Icon,color]) => (
            <div key={label} className="card" style={{ padding:20 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <Icon size={20} color={color}/>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color }}>{val}</div>
              <div style={{ fontSize:'.75rem', color:'var(--text2)', textTransform:'uppercase', letterSpacing:.5, marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
            {['all','pending','confirmed','active','completed','cancelled'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:'12px 18px', fontSize:'.82rem', fontWeight:600, letterSpacing:.3, textTransform:'capitalize', border:'none', cursor:'pointer', background:'none', borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent', color: tab===t ? 'var(--primary)' : 'var(--text2)', transition:'all .18s' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding:24 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text2)' }}>
                <Car size={48} style={{ margin:'0 auto 12px', opacity:.3 }}/>
                <p>No {tab === 'all' ? '' : tab} bookings found</p>
                <Link to="/vehicles" className="btn btn-primary" style={{ marginTop:16, display:'inline-flex' }}>Browse Vehicles</Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {filtered.map(b => (
                  <motion.div key={b.id} className="card" style={{ padding:20, border:'1px solid var(--border)' }}
                    initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'72px 1fr auto', gap:16, alignItems:'start' }}>
                      <div style={{ width:72, height:56, borderRadius:8, overflow:'hidden', background:'var(--surface2)' }}>
                        {b.vehicle?.primary_image ? (
                          <img src={b.vehicle.primary_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        ) : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>🚗</div>}
                      </div>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{b.booking_ref}</span>
                          <span className={`badge badge-${b.status}`} style={{ display:'flex', alignItems:'center', gap:3 }}>
                            {STATUS_ICON[b.status]} {b.status}
                          </span>
                        </div>
                        <div style={{ fontWeight:600, marginBottom:4 }}>{b.vehicle?.name}</div>
                        <div style={{ display:'flex', gap:16, fontSize:'.78rem', color:'var(--text2)', flexWrap:'wrap' }}>
                          <span>📅 {new Date(b.pickup_date).toLocaleDateString()} → {new Date(b.return_date).toLocaleDateString()}</span>
                          <span>📍 {b.pickup_location}</span>
                          <span>💰 ${b.total_amount}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                        <Link to={`/bookings/${b.id}`} className="btn btn-outline btn-sm">Details</Link>
                        {['pending','confirmed'].includes(b.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

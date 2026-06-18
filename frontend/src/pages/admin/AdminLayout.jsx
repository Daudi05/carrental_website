import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, Users, CreditCard, MapPin, Wrench, Tag, FileText, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const NAV = [
  { to:'/admin',            icon:<LayoutDashboard size={18}/>, label:'Dashboard', end:true },
  { to:'/admin/vehicles',   icon:<Car size={18}/>,             label:'Vehicles' },
  { to:'/admin/bookings',   icon:<Calendar size={18}/>,        label:'Bookings' },
  { to:'/admin/customers',  icon:<Users size={18}/>,           label:'Customers' },
  { to:'/admin/payments',   icon:<CreditCard size={18}/>,      label:'Payments' },
  { to:'/admin/branches',   icon:<MapPin size={18}/>,          label:'Branches' },
  { to:'/admin/maintenance',icon:<Wrench size={18}/>,          label:'Maintenance' },
  { to:'/admin/coupons',    icon:<Tag size={18}/>,             label:'Coupons' },
  { to:'/admin/audit',      icon:<FileText size={18}/>,        label:'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display:'grid', gridTemplateColumns: collapsed ? '64px 1fr' : '240px 1fr', minHeight:'100vh', transition:'grid-template-columns .25s' }}>
      {/* Sidebar */}
      <aside style={{ background:'#0f172a', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', overflow:'hidden' }}>
        <div style={{ padding:'18px 16px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Car size={18} color="white"/>
          </div>
          {!collapsed && <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:800, color:'white', whiteSpace:'nowrap' }}>DriveEase Admin</div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft:'auto', color:'rgba(255,255,255,.4)', background:'none', border:'none', cursor:'pointer', padding:4, display:'flex' }}>
            <Menu size={16}/>
          </button>
        </div>

        {!collapsed && (
          <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, flexShrink:0, fontSize:'.85rem' }}>{user?.first_name?.[0]}</div>
              <div>
                <div style={{ fontSize:'.82rem', fontWeight:600, color:'white' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize:'.68rem', color:'rgba(255,255,255,.4)', textTransform:'capitalize' }}>{user?.role?.name?.replace('_',' ')}</div>
              </div>
            </div>
          </div>
        )}

        <nav style={{ padding:'10px 8px', flex:1, overflow:'auto' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                borderRadius:8, color: isActive ? 'white' : 'rgba(255,255,255,.55)',
                background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
                marginBottom:2, transition:'all .18s', fontFamily:'var(--font)',
                fontSize:'.85rem', fontWeight:500, textDecoration:'none',
              })}>
              <span style={{ flexShrink:0 }}>{n.icon}</span>
              {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => { logout(); navigate('/'); }}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', color:'rgba(255,255,255,.4)', border:'none', borderTop:'1px solid rgba(255,255,255,.06)', background:'none', cursor:'pointer', fontFamily:'var(--font)', fontSize:'.85rem', transition:'color .18s', flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
          <LogOut size={18}/>{!collapsed && 'Sign Out'}
        </button>
      </aside>

      {/* Main */}
      <main style={{ background:'var(--surface2)', overflow:'auto' }}>
        <Outlet/>
      </main>
    </div>
  );
}

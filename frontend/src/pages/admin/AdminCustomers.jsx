import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, RefreshCw, Plus, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminCustomers() {
  const toast = useToast();
  const [users,    setUsers]   = useState([]);
  const [pagination,setPag]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState('');
  const [role,     setRole]    = useState('');
  const [page,     setPage]    = useState(1);
  const [modal,    setModal]   = useState(false);
  const [form,     setForm]    = useState({ first_name:'', last_name:'', email:'', phone:'', role:'staff', branch_id:'' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page };
      if (search) p.search = search;
      if (role)   p.role   = role;
      const res = await adminApi.users(p);
      setUsers(res.data.data);
      setPag(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const toggle = async id => {
    try {
      const res = await adminApi.toggleUser(id);
      const updated = res.data.data;
      setUsers(u => u.map(x => x.id === id ? updated : x));
      toast(`User ${updated.is_active ? 'activated' : 'deactivated'}`, 'info');
    } catch (err) { toast(typeof err === 'string' ? err : 'Failed', 'error'); }
  };

  const createStaff = async () => {
    try {
      await adminApi.createStaff(form);
      toast('Staff created. Temp password: TempPassword@2025!', 'success');
      setModal(false);
      load();
    } catch (err) { toast(typeof err === 'string' ? err : 'Failed', 'error'); }
  };

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontSize:'1.3rem', marginBottom:4 }}>Users & Customers</h2>
          <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>{pagination?.total || 0} total users</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Search size={15} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
            <input className="form-input" style={{ paddingLeft:34, width:200 }} placeholder="Search users…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="form-input" style={{ width:'auto' }} value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            {['super_admin','branch_manager','staff','customer'].map(r=><option key={r} value={r} style={{textTransform:'capitalize'}}>{r.replace('_',' ')}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/></button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={15}/> Add Staff</button>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div className="page-loader" style={{ minHeight:300 }}><div className="spinner"/></div> : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gradient)', color:'white', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.82rem' }}>{u.first_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'.875rem' }}>{u.full_name}</div>
                          <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info" style={{ textTransform:'capitalize' }}>{u.role?.name?.replace('_',' ')}</span></td>
                    <td style={{ fontSize:'.82rem', color:'var(--text2)' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize:'.78rem', color:'var(--text2)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-ghost'}`}
                        onClick={() => toggle(u.id)} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        {u.is_active ? <><UserX size={13}/> Deactivate</> : <><UserCheck size={13}/> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, padding:20, borderTop:'1px solid var(--border)' }}>
            <button className="btn btn-outline btn-sm" disabled={!pagination.has_prev} onClick={() => setPage(p=>p-1)}>← Prev</button>
            <span style={{ display:'flex', alignItems:'center', fontSize:'.875rem', color:'var(--text2)', padding:'0 12px' }}>{pagination.page} / {pagination.pages}</span>
            <button className="btn btn-outline btn-sm" disabled={!pagination.has_next} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:200 }} onClick={() => setModal(false)}/>
            <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.95 }}
              style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, width:'min(480px,95vw)', background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,.25)' }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3>Add Staff Member</h3>
                <button onClick={() => setModal(false)} style={{ background:'var(--surface2)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={16}/></button>
              </div>
              <div style={{ padding:24 }}>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))}/></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))}/></div>
                </div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    {['branch_manager','staff'].map(r=><option key={r} value={r} style={{textTransform:'capitalize'}}>{r.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div style={{ padding:'10px 14px', background:'#fef3c7', borderRadius:8, fontSize:'.78rem', color:'#92400e', marginBottom:16 }}>
                  ⚠️ Temporary password: <strong>TempPassword@2025!</strong> — staff must change on first login.
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                  <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={createStaff}>Create Staff</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

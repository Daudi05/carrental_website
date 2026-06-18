import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['','pending','confirmed','active','completed','cancelled','rejected'];

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings]  = useState([]);
  const [pagination, setPag]     = useState(null);
  const [loading, setLoading]    = useState(true);
  const [search,  setSearch]     = useState('');
  const [status,  setStatus]     = useState('');
  const [page,    setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page };
      if (search) p.search = search;
      if (status) p.status = status;
      const res = await bookingsApi.all(p);
      setBookings(res.data.data);
      setPag(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    try {
      await bookingsApi.updateStatus(id, { status: newStatus });
      toast(`Booking ${newStatus}`, 'success');
      load();
    } catch (err) { toast(typeof err === 'string' ? err : 'Update failed', 'error'); }
  };

  const STATUS_ACTIONS = {
    pending:   ['confirmed','rejected'],
    confirmed: ['active','cancelled'],
    active:    ['completed'],
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontSize:'1.3rem', marginBottom:4 }}>Bookings Management</h2>
          <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>{pagination?.total || 0} total bookings</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Search size={15} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
            <input className="form-input" style={{ paddingLeft:34, width:220 }} placeholder="Search ref, name, email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="form-input" style={{ width:'auto' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/></button>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div className="page-loader" style={{ minHeight:300 }}><div className="spinner"/></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking Ref</th><th>Customer</th><th>Vehicle</th>
                  <th>Dates</th><th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:'.82rem', color:'var(--primary)' }}>{b.booking_ref}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:'.875rem' }}>{b.customer?.full_name}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{b.customer?.email}</div>
                    </td>
                    <td style={{ fontSize:'.875rem' }}>{b.vehicle?.name}</td>
                    <td style={{ fontSize:'.78rem', color:'var(--text2)' }}>
                      {new Date(b.pickup_date).toLocaleDateString()}<br/>
                      → {new Date(b.return_date).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight:700, color:'var(--primary)' }}>${b.total_amount}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{b.duration_days} days</div>
                    </td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {(STATUS_ACTIONS[b.status] || []).map(s => (
                          <button key={s} className="btn btn-sm"
                            style={{ background: s==='confirmed'||s==='active'||s==='completed' ? 'var(--primary-light)' : '#fee2e2', color: s==='confirmed'||s==='active'||s==='completed' ? 'var(--primary)' : 'var(--danger)', fontSize:'.72rem', padding:'4px 10px', textTransform:'capitalize' }}
                            onClick={() => updateStatus(b.id, s)}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, padding:20, borderTop:'1px solid var(--border)' }}>
            <button className="btn btn-outline btn-sm" disabled={!pagination.has_prev} onClick={() => setPage(p=>p-1)}>← Prev</button>
            <span style={{ display:'flex', alignItems:'center', fontSize:'.875rem', color:'var(--text2)', padding:'0 12px' }}>
              {pagination.page} / {pagination.pages}
            </span>
            <button className="btn btn-outline btn-sm" disabled={!pagination.has_next} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

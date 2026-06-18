import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { vehiclesApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BLANK = { name:'', brand:'', model:'', year:new Date().getFullYear(), category_id:'', license_plate:'', daily_rate:'', weekly_rate:'', monthly_rate:'', deposit_amount:'', fuel_type:'petrol', transmission:'automatic', seats:5, doors:4, engine_size:'', color:'', description:'', features:'', images:'', is_featured:false, status:'available' };

export default function AdminVehicles() {
  const toast = useToast();
  const [vehicles,    setVehicles]   = useState([]);
  const [categories,  setCats]       = useState([]);
  const [pagination,  setPag]        = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [search,      setSearch]     = useState('');
  const [page,        setPage]       = useState(1);
  const [modal,       setModal]      = useState(false);
  const [editing,     setEditing]    = useState(null);
  const [form,        setForm]       = useState(BLANK);
  const [saving,      setSaving]     = useState(false);

  useEffect(() => {
    vehiclesApi.categories().then(r => setCats(r.data.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, per_page: 15 };
      if (search) p.search = search;
      const res = await vehiclesApi.list(p);
      setVehicles(res.data.data);
      setPag(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit   = v => {
    setEditing(v.id);
    setForm({
      ...BLANK, ...v,
      category_id: v.category?.id || '',
      features: (v.features || []).join(', '),
      images: (v.images || []).map(i=>i.url).join('\n'),
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.license_plate || !form.daily_rate || !form.category_id) {
      toast('Please fill all required fields', 'warning'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        year:           parseInt(form.year),
        daily_rate:     parseFloat(form.daily_rate),
        weekly_rate:    form.weekly_rate  ? parseFloat(form.weekly_rate)  : null,
        monthly_rate:   form.monthly_rate ? parseFloat(form.monthly_rate) : null,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
        features: form.features ? form.features.split(',').map(f=>f.trim()).filter(Boolean) : [],
        images:   form.images   ? form.images.split('\n').map(u=>u.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await vehiclesApi.update(editing, payload);
        toast('Vehicle updated', 'success');
      } else {
        await vehiclesApi.create(payload);
        toast('Vehicle created', 'success');
      }
      setModal(false);
      load();
    } catch (err) { toast(typeof err === 'string' ? err : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Remove this vehicle?')) return;
    try { await vehiclesApi.delete(id); toast('Vehicle removed', 'info'); load(); }
    catch (err) { toast(typeof err === 'string' ? err : 'Delete failed', 'error'); }
  };

  const F = ({ label, name, type='text', ...rest }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[name] ?? ''}
        onChange={e => setForm(f => ({ ...f, [name]: type==='number' ? e.target.value : e.target.value }))} {...rest}/>
    </div>
  );

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontSize:'1.3rem', marginBottom:4 }}>Vehicle Management</h2>
          <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>{pagination?.total || 0} vehicles in fleet</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ position:'relative' }}>
            <Search size={15} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
            <input className="form-input" style={{ paddingLeft:34, width:220 }} placeholder="Search vehicles…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/></button>
          <motion.button className="btn btn-primary btn-sm" onClick={openCreate} whileHover={{ scale:1.03 }}>
            <Plus size={16}/> Add Vehicle
          </motion.button>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div className="page-loader" style={{ minHeight:300 }}><div className="spinner"/></div> : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Vehicle</th><th>Category</th><th>Plate</th><th>Daily Rate</th><th>Status</th><th>Rating</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:52, height:40, borderRadius:6, overflow:'hidden', background:'var(--surface2)', flexShrink:0 }}>
                          {v.primary_image && <img src={v.primary_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'.875rem' }}>{v.name}</div>
                          <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{v.year} · {v.fuel_type} · {v.transmission}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'.82rem' }}>{v.category?.name}</td>
                    <td><span style={{ fontFamily:'monospace', fontSize:'.82rem', fontWeight:600, background:'var(--surface2)', padding:'3px 8px', borderRadius:4 }}>{v.license_plate}</span></td>
                    <td><strong style={{ color:'var(--primary)' }}>${v.daily_rate}</strong><span style={{ color:'var(--text3)', fontSize:'.72rem' }}>/day</span></td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                    <td>
                      {v.total_reviews > 0 ? (
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.82rem' }}>
                          ⭐ {v.rating} <span style={{ color:'var(--text3)' }}>({v.total_reviews})</span>
                        </span>
                      ) : <span style={{ color:'var(--text3)', fontSize:'.78rem' }}>No reviews</span>}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}><Edit2 size={13}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(v.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>No vehicles found</td></tr>}
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

      {/* Modal */}
      {/* Modal */}
    <AnimatePresence>
      {modal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.5)',
              zIndex: 200
            }}
            onClick={() => setModal(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 201,
              padding: '20px'
            }}
          >
            <div
              style={{
                width: 'min(700px, 95vw)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'white',
                borderRadius: 20,
                boxShadow: '0 40px 80px rgba(0,0,0,.25)'
              }}
            >
              <div
                style={{
                  padding: '22px 28px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  top: 0,
                  background: 'white',
                  zIndex: 2,
                  borderRadius: '20px 20px 0 0'
                }}
              >
                <h3>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>

                <button
                  onClick={() => setModal(false)}
                  style={{
                    background: 'var(--surface2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: 28 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0 16px'
                  }}
                >
                  <F label="Vehicle Name *" name="name" placeholder="Mercedes-Benz S-Class" />
                  <F label="Brand *" name="brand" placeholder="Mercedes-Benz" />
                  <F label="Model *" name="model" placeholder="S-Class" />
                  <F label="Year *" name="year" type="number" min={1990} max={2030} />

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-input"
                      value={form.category_id}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          category_id: parseInt(e.target.value)
                        }))
                      }
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <F label="License Plate *" name="license_plate" placeholder="KCA 001A" />
                  <F label="Daily Rate (USD) *" name="daily_rate" type="number" min={0} />
                  <F label="Weekly Rate" name="weekly_rate" type="number" min={0} />
                  <F label="Monthly Rate" name="monthly_rate" type="number" min={0} />
                  <F label="Deposit Amount" name="deposit_amount" type="number" min={0} />

                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select
                      className="form-input"
                      value={form.fuel_type}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          fuel_type: e.target.value
                        }))
                      }
                    >
                      {['petrol', 'diesel', 'electric', 'hybrid'].map(t => (
                        <option
                          key={t}
                          value={t}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transmission</label>
                    <select
                      className="form-input"
                      value={form.transmission}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          transmission: e.target.value
                        }))
                      }
                    >
                      {['automatic', 'manual'].map(t => (
                        <option
                          key={t}
                          value={t}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <F label="Seats" name="seats" type="number" min={1} max={20} />
                  <F label="Engine Size" name="engine_size" placeholder="3.0L" />
                  <F label="Color" name="color" placeholder="Silver" />

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={form.status}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          status: e.target.value
                        }))
                      }
                    >
                      {['available', 'rented', 'maintenance', 'retired'].map(s => (
                        <option
                          key={s}
                          value={s}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.description}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        description: e.target.value
                      }))
                    }
                    placeholder="Vehicle description…"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Features (comma separated)</label>
                  <input
                    className="form-input"
                    value={form.features}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        features: e.target.value
                      }))
                    }
                    placeholder="GPS, Leather Seats, Sunroof, AC"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URLs (one per line)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.images}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        images: e.target.value
                      }))
                    }
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    marginBottom: 20
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!form.is_featured}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        is_featured: e.target.checked
                      }))
                    }
                  />
                  <span
                    style={{
                      fontSize: '.875rem',
                      fontWeight: 500
                    }}
                  >
                    Mark as Featured Vehicle
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  padding: '20px 28px',
                  borderTop: '1px solid var(--border)',
                  position: 'sticky',
                  bottom: 0,
                  background: 'white',
                  zIndex: 2
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <motion.button
                  className="btn btn-primary"
                  onClick={save}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <span className="spinner" /> Saving...
                    </>
                  ) : editing ? (
                    'Update Vehicle'
                  ) : (
                    'Create Vehicle'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}

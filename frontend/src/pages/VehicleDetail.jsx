import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Users, Fuel, Settings, Shield, MapPin, Calendar,
  ChevronLeft, ChevronRight, CheckCircle, ArrowRight
} from 'lucide-react';
import { vehiclesApi, bookingsApi, reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ADDONS = [
  { name: 'GPS Navigation',    price: 10 },
  { name: 'Child Seat',        price: 12 },
  { name: 'Full Insurance',    price: 25 },
  { name: 'Additional Driver', price: 15 },
];

export default function VehicleDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const [vehicle,  setVehicle]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(false);
  const [quote,    setQuote]    = useState(null);
  const [form,     setForm]     = useState({
    pickup_location:'', dropoff_location:'', pickup_date:'', return_date:'', coupon_code:'', addons:[]
  });

  useEffect(() => {
    Promise.all([
      vehiclesApi.get(id).then(r => setVehicle(r.data.data)),
      reviewsApi.vehicle(id).then(r => setReviews(r.data.data)),
    ]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (vehicle && form.pickup_date && form.return_date) {
      const selectedAddons = ADDONS.filter(a => form.addons.includes(a.name));
      bookingsApi.quote({
        vehicle_id: vehicle.id,
        pickup_date: form.pickup_date,
        return_date: form.return_date,
        coupon_code: form.coupon_code || undefined,
      }).then(r => setQuote(r.data.data)).catch(() => {});
    }
  }, [vehicle, form.pickup_date, form.return_date, form.coupon_code]);

  const handleBook = async () => {
    if (!user) { navigate('/login', { state: { from: `/vehicles/${id}` } }); return; }
    if (!form.pickup_location || !form.pickup_date || !form.return_date) {
      toast('Please fill in all required fields', 'warning'); return;
    }
    setBooking(true);
    try {
      const selectedAddons = ADDONS.filter(a => form.addons.includes(a.name));
      const res = await bookingsApi.create({
        vehicle_id:       vehicle.id,
        pickup_location:  form.pickup_location,
        dropoff_location: form.dropoff_location || form.pickup_location,
        pickup_date:      form.pickup_date,
        return_date:      form.return_date,
        coupon_code:      form.coupon_code || undefined,
        addons:           selectedAddons,
      });
      toast('Booking created! Awaiting confirmation.', 'success');
      navigate('/dashboard');
    } catch (err) { toast(typeof err === 'string' ? err : 'Booking failed', 'error'); }
    finally { setBooking(false); }
  };

  const toggleAddon = name => setForm(f => ({
    ...f, addons: f.addons.includes(name) ? f.addons.filter(a => a !== name) : [...f.addons, name]
  }));

  if (loading) return <div className="page-loader" style={{ paddingTop:'var(--nav-height)' }}><div className="spinner"/></div>;
  if (!vehicle) return <div style={{ padding:'100px 24px', textAlign:'center' }}>Vehicle not found</div>;

  const images = vehicle.images || [];
  const imgs   = images.length > 0 ? images : [{ url: vehicle.primary_image }];

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--surface2)' }}>
      {/* Breadcrumb */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'14px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.82rem', color:'var(--text2)' }}>
          <Link to="/">Home</Link> <ChevronRight size={14}/>
          <Link to="/vehicles">Vehicles</Link> <ChevronRight size={14}/>
          <span style={{ color:'var(--text)' }}>{vehicle.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:36, alignItems:'start' }}>

          {/* Left — Images + Details */}
          <div>
            {/* Gallery */}
            <div className="card" style={{ overflow:'hidden', marginBottom:24 }}>
              <div style={{ position:'relative', height:440, background:'var(--surface2)' }}>
                {imgs[imgIdx]?.url ? (
                  <img src={imgs[imgIdx].url} alt={vehicle.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>🚗</div>
                )}
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((imgIdx-1+imgs.length)%imgs.length)}
                      style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:40, height:40, borderRadius:'50%', background:'rgba(0,0,0,.5)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <ChevronLeft size={20}/>
                    </button>
                    <button onClick={() => setImgIdx((imgIdx+1)%imgs.length)}
                      style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:40, height:40, borderRadius:'50%', background:'rgba(0,0,0,.5)', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <ChevronRight size={20}/>
                    </button>
                    <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
                      {imgs.map((_,i) => <button key={i} onClick={()=>setImgIdx(i)} style={{ width:8, height:8, borderRadius:'50%', border:'none', cursor:'pointer', background: i===imgIdx ? 'white' : 'rgba(255,255,255,.5)' }}/>)}
                    </div>
                  </>
                )}
              </div>
              {imgs.length > 1 && (
                <div style={{ display:'flex', gap:8, padding:12, overflowX:'auto' }}>
                  {imgs.map((img,i) => (
                    <img key={i} src={img.url} alt="" onClick={() => setImgIdx(i)}
                      style={{ width:80, height:60, objectFit:'cover', borderRadius:8, cursor:'pointer', opacity:i===imgIdx?1:.6, border: i===imgIdx ? '2px solid var(--primary)' : '2px solid transparent', flexShrink:0 }}/>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card" style={{ padding:28, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom:8 }}>{vehicle.category?.name}</span>
                  <h1 style={{ fontSize:'1.8rem', marginBottom:8 }}>{vehicle.name}</h1>
                  {vehicle.total_reviews > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s<=Math.round(vehicle.rating)?'#f59e0b':'#e2e8f0'} color={s<=Math.round(vehicle.rating)?'#f59e0b':'#e2e8f0'}/>)}
                      <span style={{ fontWeight:600 }}>{vehicle.rating}</span>
                      <span style={{ color:'var(--text3)', fontSize:'.82rem' }}>({vehicle.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, color:'var(--primary)' }}>${vehicle.daily_rate}</div>
                  <div style={{ fontSize:'.82rem', color:'var(--text3)' }}>per day</div>
                </div>
              </div>

              {/* Specs grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22, padding:'16px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
                {[
                  ['Fuel Type',     vehicle.fuel_type,     Fuel],
                  ['Transmission',  vehicle.transmission,  Settings],
                  ['Seats',         vehicle.seats && `${vehicle.seats} seats`, Users],
                  ['Year',          vehicle.year,          Calendar],
                ].filter(([,v])=>v).map(([label, val, Icon]) => (
                  <div key={label} style={{ textAlign:'center', padding:'12px 8px', background:'var(--surface2)', borderRadius:10 }}>
                    <Icon size={20} color="var(--primary)" style={{ margin:'0 auto 6px', display:'block' }}/>
                    <div style={{ fontSize:'.72rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:3 }}>{label}</div>
                    <div style={{ fontWeight:600, textTransform:'capitalize', fontSize:'.875rem' }}>{val}</div>
                  </div>
                ))}
              </div>

              {vehicle.description && (
                <p style={{ color:'var(--text2)', lineHeight:1.8, marginBottom:20 }}>{vehicle.description}</p>
              )}

              {/* Features */}
              {vehicle.features?.length > 0 && (
                <div>
                  <div style={{ fontWeight:700, marginBottom:12 }}>Features & Amenities</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {vehicle.features.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', background:'var(--primary-light)', borderRadius:100, fontSize:'.78rem', fontWeight:600, color:'var(--primary)' }}>
                        <CheckCircle size={13}/> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card" style={{ padding:28 }}>
                <h3 style={{ marginBottom:20 }}>Customer Reviews</h3>
                {reviews.slice(0,4).map(r => (
                  <div key={r.id} style={{ padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gradient)', color:'white', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{r.author?.first_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'.875rem' }}>{r.author?.first_name} {r.author?.last_name}</div>
                          <div style={{ fontSize:'.72rem', color:'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(s=><Star key={s} size={13} fill={s<=r.rating?'#f59e0b':'#e2e8f0'} color={s<=r.rating?'#f59e0b':'#e2e8f0'}/>)}</div>
                    </div>
                    {r.title && <div style={{ fontWeight:600, marginBottom:6, fontSize:'.9rem' }}>{r.title}</div>}
                    <p style={{ color:'var(--text2)', fontSize:'.875rem', lineHeight:1.7 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Booking Form */}
          <div style={{ position:'sticky', top:'calc(var(--nav-height) + 24px)' }}>
            <motion.div className="card" style={{ padding:28 }} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, color:'var(--primary)', marginBottom:4 }}>
                ${vehicle.daily_rate}<span style={{ fontFamily:'var(--font)', fontSize:'.9rem', color:'var(--text3)', fontWeight:400 }}>/day</span>
              </div>
              {vehicle.weekly_rate && <div style={{ fontSize:'.78rem', color:'var(--text2)', marginBottom:20 }}>Weekly: ${vehicle.weekly_rate} · Monthly: ${vehicle.monthly_rate}</div>}

              <div className="form-group">
                <label className="form-label">Pick-up Location *</label>
                <input className="form-input" placeholder="e.g. Nairobi CBD, JKIA Airport"
                  value={form.pickup_location} onChange={e=>setForm({...form,pickup_location:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Drop-off Location</label>
                <input className="form-input" placeholder="Same as pick-up if empty"
                  value={form.dropoff_location} onChange={e=>setForm({...form,dropoff_location:e.target.value})}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pick-up Date *</label>
                  <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]}
                    value={form.pickup_date} onChange={e=>setForm({...form,pickup_date:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Return Date *</label>
                  <input className="form-input" type="date" min={form.pickup_date || new Date().toISOString().split('T')[0]}
                    value={form.return_date} onChange={e=>setForm({...form,return_date:e.target.value})}/>
                </div>
              </div>

              {/* Addons */}
              <div style={{ marginBottom:16 }}>
                <div className="form-label">Add-on Services</div>
                {ADDONS.map(a => (
                  <label key={a.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <input type="checkbox" checked={form.addons.includes(a.name)} onChange={() => toggleAddon(a.name)}/>
                      <span style={{ fontSize:'.875rem' }}>{a.name}</span>
                    </div>
                    <span style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text2)' }}>+${a.price}/day</span>
                  </label>
                ))}
              </div>

              {/* Coupon */}
              <div className="form-group">
                <label className="form-label">Coupon Code</label>
                <input className="form-input" placeholder="e.g. WELCOME20"
                  value={form.coupon_code} onChange={e=>setForm({...form,coupon_code:e.target.value.toUpperCase()})}/>
              </div>

              {/* Quote */}
              {quote && (
                <div style={{ background:'var(--primary-light)', borderRadius:10, padding:14, marginBottom:16, fontSize:'.875rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ color:'var(--text2)' }}>Base ({quote.days} days)</span>
                    <span>${quote.base}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, color:'var(--success)' }}>
                      <span>Discount</span><span>-${quote.discount}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ color:'var(--text2)' }}>Tax (16%)</span><span>${quote.tax}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1rem', paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <span>Total</span><span style={{ color:'var(--primary)' }}>${quote.total}</span>
                  </div>
                  <div style={{ fontSize:'.72rem', color:'var(--text3)', marginTop:6 }}>+ Security deposit: ${vehicle.deposit_amount || 0}</div>
                </div>
              )}

              <motion.button className="btn btn-primary w-full btn-lg" onClick={handleBook}
                disabled={booking} whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                style={{ justifyContent:'center', marginBottom:10 }}>
                {booking ? <><span className="spinner"/> Processing…</> : user ? <><Calendar size={18}/> Book Now</> : 'Sign In to Book'}
              </motion.button>
              <p style={{ fontSize:'.72rem', color:'var(--text3)', textAlign:'center' }}>
                Free cancellation up to 24 hours before pickup · No credit card required
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

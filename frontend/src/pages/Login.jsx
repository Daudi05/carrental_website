import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, isAdmin } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from || '/';
  const [form,   setForm]   = useState({ email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading,setLoading]= useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.first_name}!`, 'success');
      if (isAdmin()) navigate('/admin');
      else navigate(typeof from === 'string' ? from : '/');
    } catch (err) { toast(typeof err === 'string' ? err : 'Login failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      {/* Left — Image */}
      <div style={{ background:'linear-gradient(135deg,#1a56db,#0ea5e9)', display:'flex', flexDirection:'column', justifyContent:'center', padding:60, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200) center/cover', opacity:.15 }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48, color:'white' }}>
            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,.2)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}><Car size={24}/></div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>DriveEase</div>
              <div style={{ fontSize:'.65rem', opacity:.7, letterSpacing:2, textTransform:'uppercase' }}>Premium Car Rental</div>
            </div>
          </div>
          <h2 style={{ color:'white', marginBottom:16 }}>Drive Your Dreams</h2>
          <p style={{ color:'rgba(255,255,255,.8)', lineHeight:1.8, maxWidth:360 }}>Kenya's most trusted car rental service — premium vehicles, seamless booking, unforgettable journeys.</p>
          <div style={{ marginTop:40, display:'flex', flexDirection:'column', gap:12 }}>
            {['15,000+ happy customers','100+ premium vehicles','5 locations across Kenya','24/7 roadside support'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,.85)', fontSize:'.875rem' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.7rem' }}>✓</div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40, background:'var(--surface2)' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:420 }}>
          <div className="card" style={{ padding:40 }}>
            <h2 style={{ marginBottom:6 }}>Sign In</h2>
            <p style={{ color:'var(--text2)', marginBottom:28, fontSize:'.875rem' }}>
              New to DriveEase? <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Create account</Link>
            </p>

            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@email.com"
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position:'relative' }}>
                  <input className="form-input" type={showPw?'text':'password'} placeholder="••••••••"
                    value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={{ paddingRight:44 }}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                    {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
              <motion.button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}
                whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} style={{ justifyContent:'center', marginTop:4 }}>
                {loading?<><span className="spinner"/>Signing In…</>:<><LogIn size={16}/>Sign In</>}
              </motion.button>
            </form>

            
              
          </div>
        </motion.div>
      </div>
    </div>
  );
}

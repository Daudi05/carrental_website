import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const [form,   setForm]   = useState({ first_name:'', last_name:'', email:'', phone:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading,setLoading]= useState(false);

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 8) { toast('Password must be at least 8 characters', 'warning'); return; }
    setLoading(true);
    try {
      await register(form);
      toast('Welcome to LuxeDrive!', 'success');
      navigate('/vehicles');
    } catch (err) { toast(typeof err === 'string' ? err : 'Registration failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 24px 40px' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:520 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', color:'white' }}><Car size={26}/></div>
          <h2 style={{ marginBottom:6 }}>Create Your Account</h2>
          <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>Already have an account? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in</Link></p>
        </div>
        <div className="card" style={{ padding:36 }}>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" placeholder="John" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-input" placeholder="Kamau" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" placeholder="john@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password * (min 8 characters)</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPw?'text':'password'} placeholder="Create a strong password"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={{ paddingRight:44 }}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <p style={{ fontSize:'.72rem', color:'var(--text3)', marginBottom:16 }}>
              By creating an account you agree to our <Link to="#" style={{ color:'var(--primary)' }}>Terms of Service</Link> and <Link to="#" style={{ color:'var(--primary)' }}>Privacy Policy</Link>.
            </p>
            <motion.button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} style={{ justifyContent:'center' }}>
              {loading?<><span className="spinner"/>Creating Account…</>:<><UserPlus size={16}/>Create Account</>}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

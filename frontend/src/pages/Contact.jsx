import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaClock, FaPaperPlane, FaInstagram, FaFacebook, FaTwitter, FaEnvelope } from 'react-icons/fa';
import api  from '../services/api';

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const BRANCHES = [
  { name:'Nairobi CBD',  address:'Kimathi Street, Nairobi',       phone:'+254 700 000 001', hours:'Mon–Fri 8am–6pm · Sat 9am–2pm' },
  { name:'Mombasa',      address:'Moi Avenue, Mombasa',           phone:'+254 700 000 002', hours:'Mon–Fri 8am–6pm · Sat 9am–2pm' },
  { name:'Kisumu',       address:'Oginga Odinga St, Kisumu',      phone:'+254 700 000 003', hours:'Mon–Fri 8am–5pm' },
];

export default function Contact() {
  const [form,   setForm]   = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    } catch (err) {
      setStatus('error');
      setErrMsg(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ paddingTop:68, background:'#f8fafc' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ background:'#1e293b', padding:'72px 0 64px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(59,130,246,.2) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 80% 30%, rgba(99,102,241,.15) 0%, transparent 60%)', pointerEvents:'none' }}/>
        <motion.div className="container" style={{ position:'relative', zIndex:1, textAlign:'center' }}
          initial="hidden" animate="visible" variants={stagger}>
          <motion.span variants={fadeUp} style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#60a5fa', background:'rgba(96,165,250,.12)', border:'1px solid rgba(96,165,250,.3)', padding:'5px 16px', borderRadius:100, marginBottom:18 }}>
            Get in Touch
          </motion.span>
          <motion.h1 variants={fadeUp} style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:800, color:'white', marginBottom:16, lineHeight:1.1 }}>
            We're Here to Help
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize:'1rem', color:'rgba(255,255,255,.65)', maxWidth:480, margin:'0 auto', lineHeight:1.75 }}>
            Have a question about a booking, need help choosing a vehicle, or want to partner with us? Reach out anytime.
          </motion.p>
        </motion.div>
      </div>

      {/* ── MAIN GRID ────────────────────────────────────── */}
      <div className="container" style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:64, padding:'80px 24px' }}>

        {/* Left — info */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ fontSize:'1.5rem', marginBottom:10 }}>Contact Information</motion.h2>
          <motion.p variants={fadeUp} style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, marginBottom:36 }}>
            Reach us through any of these channels — we respond within 2 hours during business hours.
          </motion.p>

          {[
            { icon:<FaEnvelope size={18}/>,  label:'Email',   value:'hello@luxedrive.co.ke', href:'mailto:hello@drivease.co.ke' },
            { icon:<FaPhone size={18}/>, label:'Phone',   value:'+254 700 000 001',     href:'tel:+254700000001' },
            { icon:<FaMapMarkerAlt size={18}/>,label:'HQ',      value:'Kimathi Street, Nairobi, Kenya', href:null },
            { icon:<FaClock size={18}/>, label:'Hours',   value:'Mon–Sat: 8am – 6pm',  href:null },
          ].map(({ icon, label, value, href }) => (
            <motion.div key={label} variants={fadeUp} style={{ display:'flex', alignItems:'flex-start', gap:16, padding:'16px 18px', background:'white', borderRadius:14, border:'1px solid #e2e8f0', marginBottom:12, transition:'box-shadow .2s, transform .2s' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#eff6ff', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'#94a3b8', marginBottom:3 }}>{label}</div>
                {href
                  ? <a href={href} style={{ fontSize:'.9rem', fontWeight:600, color:'#3b82f6', textDecoration:'none' }}>{value}</a>
                  : <div style={{ fontSize:'.9rem', fontWeight:600, color:'#0f172a' }}>{value}</div>
                }
              </div>
            </motion.div>
          ))}

          {/* Socials */}
          <motion.div variants={fadeUp} style={{ marginTop:28 }}>
            <div style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#94a3b8', marginBottom:14 }}>Follow Us</div>
            <div style={{ display:'flex', gap:10 }}>
              {[
                { icon:<FaInstagram size={18}/>, href:'#', color:'#E1306C' },
                { icon:<FaFacebook  size={18}/>, href:'#', color:'#1877F2' },
                { icon:<FaTwitter   size={18}/>, href:'#', color:'#1DA1F2' },
              ].map((s, i) => (
                <motion.a key={i} href={s.href} style={{ width:40, height:40, borderRadius:10, border:'1.5px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', textDecoration:'none', transition:'all .2s' }}
                  whileHover={{ background:s.color, borderColor:s.color, color:'white', y:-2 }}>
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right — form */}
        <motion.div initial={{ opacity:0, y:48 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.7 }}
          style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', boxShadow:'0 4px 32px rgba(0,0,0,.06)', overflow:'hidden' }}>

          {status === 'success' ? (
            <motion.div style={{ padding:'64px 40px', textAlign:'center' }}
              initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:.5, ease:'backOut' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0fdf4', color:'#10b981', fontSize:'1.8rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>✓</div>
              <h3 style={{ fontSize:'1.4rem', marginBottom:8 }}>Message Sent!</h3>
              <p style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, maxWidth:280, margin:'0 auto 24px' }}>
                Thank you for reaching out. We'll get back to you within 2 hours.
              </p>
              <button onClick={() => setStatus('idle')} style={{ padding:'10px 24px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'.875rem' }}>
                Send Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} style={{ padding:40 }}>
              <h2 style={{ fontSize:'1.4rem', marginBottom:6 }}>Send a Message</h2>
              <p style={{ color:'#64748b', fontSize:'.85rem', marginBottom:28 }}>We'll respond as soon as possible.</p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:6, color:'#475569' }}>Full Name *</label>
                  <input style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'.875rem', outline:'none', boxSizing:'border-box', background:'#f8fafc' }}
                    placeholder="Jane Kamau" value={form.name} onChange={e=>set('name',e.target.value)} required/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:6, color:'#475569' }}>Email *</label>
                  <input type="email" style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'.875rem', outline:'none', boxSizing:'border-box', background:'#f8fafc' }}
                    placeholder="jane@email.com" value={form.email} onChange={e=>set('email',e.target.value)} required/>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:6, color:'#475569' }}>Phone</label>
                  <input style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'.875rem', outline:'none', boxSizing:'border-box', background:'#f8fafc' }}
                    placeholder="+254 7XX XXX XXX" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:6, color:'#475569' }}>Subject</label>
                  <input style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'.875rem', outline:'none', boxSizing:'border-box', background:'#f8fafc' }}
                    placeholder="Booking enquiry…" value={form.subject} onChange={e=>set('subject',e.target.value)}/>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, marginBottom:6, color:'#475569' }}>Message *</label>
                <textarea style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'.875rem', outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', background:'#f8fafc' }}
                  rows={5} placeholder="Tell us how we can help…" value={form.message} onChange={e=>set('message',e.target.value)} required/>
              </div>

              {status === 'error' && (
                <div style={{ background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:'.85rem', marginBottom:16 }}>{errMsg}</div>
              )}

              <motion.button type="submit" disabled={status==='loading'}
                style={{ width:'100%', padding:'14px', background:'#1e293b', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:'.95rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                whileHover={{ background:'#3b82f6' }} whileTap={{ scale:.98 }}>
                {status === 'loading' ? 'Sending…' : <><FaPaperPlane size={16}/> Send Message</>}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      {/* ── BRANCH LOCATIONS ─────────────────────────────── */}
      <section style={{ background:'white', padding:'80px 0' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#3b82f6', marginBottom:14 }}>Our Locations</span>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)' }}>Find Us Near You</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {BRANCHES.map((b, i) => (
              <motion.div key={i} style={{ background:'#f8fafc', borderRadius:16, border:'1px solid #e2e8f0', padding:'28px 24px' }}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
                whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,.08)' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#eff6ff', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <FaMapMarkerAlt size={20}/>
                </div>
                <h3 style={{ fontSize:'1rem', marginBottom:8 }}>{b.name}</h3>
                <p style={{ fontSize:'.85rem', color:'#64748b', marginBottom:6 }}>{b.address}</p>
                <a href={`tel:${b.phone.replace(/\s/g,'')}`} style={{ fontSize:'.85rem', color:'#3b82f6', fontWeight:600, textDecoration:'none', display:'block', marginBottom:6 }}>{b.phone}</a>
                <p style={{ fontSize:'.78rem', color:'#94a3b8' }}>{b.hours}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP ───────────────────────────────────────────── */}
      <div>
        <iframe title="LuxeDrive Nairobi" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19891433132!2d36.70730744863281!3d-1.3031933999999976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1718000000000!5m2!1sen!2ske"
          width="100%" height="360" style={{ border:0, display:'block', filter:'grayscale(15%)' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
      </div>

    </div>
  );
}
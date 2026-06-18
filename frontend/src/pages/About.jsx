import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Shield, Award, Clock, MapPin, Users, Car, Star, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function Reveal({ children, className = '', style = {} }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: '2018', label: 'Founded' },
  { value: '5K+',  label: 'Happy Customers' },
  { value: '200+', label: 'Vehicles' },
  { value: '3',    label: 'Locations' },
];

const VALUES = [
  { icon: <Shield size={22}/>,  title: 'Safety First',       desc: 'Every vehicle is inspected before each rental. Your safety is our top priority.' },
  { icon: <Award size={22}/>,   title: 'Quality Fleet',      desc: 'We stock only late-model, well-maintained vehicles from top manufacturers.' },
  { icon: <Clock size={22}/>,   title: '24/7 Support',       desc: 'Our team is available around the clock for assistance, wherever you are.' },
  { icon: <MapPin size={22}/>,  title: 'Kenya-Wide',         desc: 'Locations in Nairobi, Mombasa and Kisumu with nationwide delivery options.' },
];

const TEAM = [
  { name: 'David Johns',    role: 'Founder & CEO',           image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Amara Bright',  role: 'Head of Operations',      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'Brian Brownski',  role: 'Fleet Manager',           image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
];

export default function About() {
  return (
    <div style={{ paddingTop: 68, background: '#f8fafc' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position:'relative', height:'72vh', minHeight:480, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
        <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=90"
          alt="DriveEase" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,10,10,.8) 0%, rgba(10,10,10,.3) 60%, transparent 100%)' }}/>
        <motion.div className="container" style={{ position:'relative', zIndex:1, paddingBottom:72, color:'white', maxWidth:720 }}
          initial="hidden" animate="visible" variants={stagger}>
          <motion.span variants={staggerItem} style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#60a5fa', background:'rgba(96,165,250,.15)', border:'1px solid rgba(96,165,250,.3)', padding:'5px 16px', borderRadius:100, marginBottom:18 }}>
            Our Story
          </motion.span>
          <motion.h1 variants={staggerItem} style={{ fontSize:'clamp(2.4rem,6vw,4.5rem)', fontWeight:800, lineHeight:1.05, marginBottom:18, color:'white' }}>
            Kenya's Most Trusted<br /><em style={{ fontStyle:'italic', color:'#60a5fa' }}>Car Rental</em>
          </motion.h1>
          <motion.p variants={staggerItem} style={{ fontSize:'1.05rem', color:'rgba(255,255,255,.75)', lineHeight:1.75, maxWidth:500 }}>
            Since 2018, LuxeDrive has been connecting Kenyans with quality vehicles for every journey — from business trips to family adventures.
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ background:'#1e293b', padding:'36px 0' }}>
        <div className="container">
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={staggerItem} style={{ textAlign:'center', padding:'20px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
                <div style={{ fontFamily:'var(--font-display,serif)', fontSize:'2rem', fontWeight:700, color:'#60a5fa', marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:'.72rem', fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,.4)' }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── STORY ────────────────────────────────────────── */}
      <section style={{ padding:'96px 0', background:'white' }}>
        <div className="container" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
          <Reveal>
            <div style={{ position:'relative' }}>
              <img src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=85"
                alt="Our Story" style={{ width:'100%', height:500, objectFit:'cover', borderRadius:20, display:'block' }}/>
              <motion.div style={{ position:'absolute', bottom:-20, right:-20, background:'#3b82f6', color:'white', borderRadius:16, padding:'20px 24px', textAlign:'center', boxShadow:'0 12px 40px rgba(59,130,246,.4)' }}
                initial={{ opacity:0, scale:.7 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:.4, duration:.6, ease:'backOut' }}>
                <div style={{ fontFamily:'var(--font-display,serif)', fontSize:'2rem', fontWeight:700, lineHeight:1 }}>2018</div>
                <div style={{ fontSize:'.72rem', fontWeight:600, letterSpacing:2, textTransform:'uppercase', opacity:.85 }}>Est. Nairobi</div>
              </motion.div>
            </div>
          </Reveal>
          <Reveal>
            <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#3b82f6', marginBottom:16 }}>How It Started</span>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', marginBottom:20, lineHeight:1.15 }}>Built for the Modern Kenyan Driver</h2>
            <p style={{ color:'#64748b', lineHeight:1.8, marginBottom:16 }}>
              LuxeDrive was founded by a group of Nairobi entrepreneurs frustrated by the lack of transparent, reliable car rental options in Kenya. They set out to build something different — a service that combined global standards with local knowledge.
            </p>
            <p style={{ color:'#64748b', lineHeight:1.8, marginBottom:16 }}>
              Starting with just 12 vehicles in Nairobi CBD, we've grown to a fleet of 200+ cars across three cities, serving thousands of customers every year — from solo business travellers to large family groups.
            </p>
            <p style={{ color:'#64748b', lineHeight:1.8, marginBottom:32 }}>
              Today, LuxeDrive is Kenya's most-reviewed car rental service, known for transparent pricing, immaculate vehicles, and a support team that actually picks up the phone.
            </p>
            <Link to="/vehicles" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', background:'#3b82f6', color:'white', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:'.9rem' }}>
              Browse Our Fleet <ArrowRight size={16}/>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section style={{ padding:'96px 0', background:'#f8fafc' }}>
        <div className="container">
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#3b82f6', marginBottom:14 }}>Our Values</span>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)' }}>Why Customers Choose LuxeDrive</h2>
          </Reveal>
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:'-60px' }}>
            {VALUES.map((v, i) => (
              <motion.div key={i} variants={staggerItem} style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:'32px 24px', textAlign:'center', transition:'box-shadow .2s, transform .2s', cursor:'default' }}
                whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,.08)' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'#eff6ff', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>{v.icon}</div>
                <h3 style={{ fontSize:'1rem', marginBottom:10 }}>{v.title}</h3>
                <p style={{ fontSize:'.85rem', color:'#64748b', lineHeight:1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────── */}
      <section style={{ padding:'96px 0', background:'white' }}>
        <div className="container">
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#3b82f6', marginBottom:14 }}>The Team</span>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)' }}>Meet the People Behind DriveEase</h2>
          </Reveal>
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28, maxWidth:860, margin:'0 auto' }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {TEAM.map((m, i) => (
              <motion.div key={i} variants={staggerItem} style={{ borderRadius:20, overflow:'hidden', border:'1px solid #e2e8f0', background:'#f8fafc' }}
                whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,.09)' }}>
                <div style={{ aspectRatio:'4/3', overflow:'hidden' }}>
                  <img src={m.image} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', transition:'transform .5s' }}/>
                </div>
                <div style={{ padding:24 }}>
                  <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:4 }}>{m.name}</div>
                  <div style={{ fontSize:'.75rem', fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', color:'#3b82f6' }}>{m.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding:'96px 0', background:'#1e293b', textAlign:'center' }}>
        <div className="container">
          <Reveal>
            <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#60a5fa', marginBottom:16 }}>Ready to Drive?</span>
            <h2 style={{ fontSize:'clamp(2rem,4vw,3rem)', color:'white', marginBottom:14 }}>Your Next Journey Starts Here</h2>
            <p style={{ color:'rgba(255,255,255,.6)', maxWidth:420, margin:'0 auto 32px', lineHeight:1.75 }}>
              Browse our fleet of 200+ vehicles and book in minutes. Free cancellation on all bookings.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/vehicles" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', background:'#3b82f6', color:'white', borderRadius:10, fontWeight:700, textDecoration:'none' }}>
                Browse Fleet <ArrowRight size={16}/>
              </Link>
              <Link to="/contact" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', border:'1.5px solid rgba(255,255,255,.25)', color:'white', borderRadius:10, fontWeight:600, textDecoration:'none' }}>
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
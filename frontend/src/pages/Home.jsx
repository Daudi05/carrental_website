import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Search, MapPin, Calendar, ChevronRight, Star, Shield,
  Clock, Award, ArrowRight, Car, Users, Zap, CheckCircle,
  Phone, ChevronLeft, Play
} from 'lucide-react';
import { vehiclesApi, publicApi } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import './Home.css';

const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=90',
    tag: 'Premium Fleet',
    title: ['Drive in', 'Pure Luxury'],
    sub: 'Experience Kenya\'s finest vehicles with transparent pricing and 24/7 support.',
    cta: 'Explore Fleet',
  },
  {
    bg: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&q=90',
    tag: 'Adventure Ready',
    title: ['Conquer', 'Every Terrain'],
    sub: 'From city streets to safari trails — our SUV fleet is built for any journey.',
    cta: 'Book an SUV',
  },
  {
    bg: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1920&q=90',
    tag: 'Electric Future',
    title: ['Go Green,', 'Drive Smart'],
    sub: 'Zero-emission vehicles for eco-conscious travellers. The future is electric.',
    cta: 'See Electric Cars',
  },
];

const CATEGORIES = [
  { slug: 'luxury',   label: 'Luxury',     desc: 'Premium comfort', color: '#f59e0b', bg: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400' },
  { slug: 'suv',      label: 'SUV',         desc: 'Power & space',   color: '#3b82f6', bg: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400' },
  { slug: 'sedan',    label: 'Sedan',       desc: 'Elegant & smooth',color: '#10b981', bg: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400' },
  { slug: 'electric', label: 'Electric',    desc: 'Eco-friendly',    color: '#6366f1', bg: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400' },
  { slug: 'sports',   label: 'Sports',      desc: 'Pure performance',color: '#ef4444', bg: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400' },
];

const WHY_US = [
  { icon: <Shield size={28}/>, title: 'Fully Insured',       desc: 'All vehicles come with comprehensive insurance coverage for peace of mind.',    color: '#3b82f6' },
  { icon: <Clock size={28}/>,  title: '24/7 Support',        desc: 'Our dedicated support team is available round the clock, every day of the year.', color: '#10b981' },
  { icon: <Award size={28}/>,  title: 'Best Price Guarantee',desc: 'Find a lower price elsewhere and we\'ll match it — guaranteed.',                  color: '#f59e0b' },
  { icon: <Zap size={28}/>,    title: 'Instant Booking',     desc: 'Book your vehicle in under 2 minutes with our streamlined reservation system.',   color: '#6366f1' },
];

const TESTIMONIALS = [
  { name: 'Sarah Wanjiku', role: 'Business Executive', text: 'LuxeDrive completely transformed my business travel experience. The Mercedes S-Class was immaculate and the service was five-star throughout.', rating: 5, location: 'Nairobi, Kenya' },
  { name: 'James Kariuki',  role: 'Tourism Director',  text: 'I use LuxeDrive for all corporate events. Their fleet is pristine, chauffeurs are professional and booking is seamlessly easy.', rating: 5, location: 'Mombasa, Kenya' },
  { name: 'Amina Hassan',   role: 'Travel Blogger',    text: 'The Mercedes GLE was perfect for my cross-Kenya road trip. Zero emissions, zero fuss. LuxeDrive made the whole process effortless.', rating: 5, location: 'Kisumu, Kenya' },
];

function SearchBar({ onSearch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ location: '', pickup: '', return: '' });

  const handle = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.location) params.set('location', form.location);
    if (form.pickup)   params.set('pickup_date', form.pickup);
    if (form.return)   params.set('return_date', form.return);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <motion.form className="search-bar card"
      initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.7, delay:.5 }} onSubmit={handle}>
      <div className="search-field">
        <MapPin size={18} color="var(--primary)"/>
        <input placeholder="Pick-up Location" value={form.location}
          onChange={e=>setForm({...form,location:e.target.value})} className="search-input"/>
      </div>
      <div className="search-divider"/>
      <div className="search-field">
        <Calendar size={18} color="var(--primary)"/>
        <input type="date" placeholder="Pick-up Date" value={form.pickup}
          onChange={e=>setForm({...form,pickup:e.target.value})} className="search-input"/>
      </div>
      <div className="search-divider"/>
      <div className="search-field">
        <Calendar size={18} color="var(--primary)"/>
        <input type="date" placeholder="Return Date" value={form.return}
          onChange={e=>setForm({...form,return:e.target.value})} className="search-input"/>
      </div>
      <motion.button type="submit" className="btn btn-primary search-btn"
        whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}>
        <Search size={18}/> Search Cars
      </motion.button>
    </motion.form>
  );
}

export default function Home() {
  const [slide,    setSlide]    = useState(0);
  const [fading,   setFading]   = useState(false);
  const [featured, setFeatured] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [testIdx,  setTestIdx]  = useState(0);
  const timerRef = useRef(null);
  const heroRef  = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);

  const goTo = idx => {
    setFading(true);
    setTimeout(() => { setSlide(idx); setFading(false); }, 400);
  };
  const nextSlide = () => goTo((slide + 1) % HERO_SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 6500);
    return () => clearInterval(timerRef.current);
  }, [slide]);

  useEffect(() => {
    vehiclesApi.list({ featured: true, per_page: 8 }).then(r => setFeatured(r.data.data)).catch(() => {});
    publicApi.stats().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const s = HERO_SLIDES[slide];

  return (
    <div className="home-page">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <AnimatePresence mode="sync">
          <motion.div key={slide} className="hero-bg"
            style={{ backgroundImage: `url(${s.bg})` }}
            initial={{ opacity:0, scale:1.05 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0 }} transition={{ duration:1.2, ease:'easeInOut' }} />
        </AnimatePresence>
        <div className="hero-overlay"/>

        <motion.div style={{ y: heroY }} className="hero-wrap">
          <AnimatePresence mode="wait">
            <motion.div key={slide} className="hero-content"
              initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-30 }} transition={{ duration:.7 }}>

              <motion.span className="hero-tag" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1 }}>
                {s.tag}
              </motion.span>
              <motion.h1 className="hero-title" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}>
                {s.title[0]}<br/><em style={{ color:'var(--accent)' }}>{s.title[1]}</em>
              </motion.h1>
              <motion.p className="hero-sub" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.35 }}>
                {s.sub}
              </motion.p>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.48 }}
                style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <Link to="/vehicles">
                  <motion.span className="btn btn-white btn-xl" style={{ display:'inline-flex' }}
                    whileHover={{ scale:1.04 }} whileTap={{ scale:.97 }}>
                    {s.cta} <ArrowRight size={18}/>
                  </motion.span>
                </Link>
                <Link to="/about">
                  <motion.span className="btn btn-outline-white btn-xl" style={{ display:'inline-flex', border:'2px solid rgba(255,255,255,.4)', color:'white' }}
                    whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}>
                    <Play size={16} fill="white"/> Watch Video
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Slide controls */}
          <div className="hero-controls">
            <button className="hero-ctrl" onClick={() => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
              <ChevronLeft size={20}/>
            </button>
            <div style={{ display:'flex', gap:6 }}>
              {HERO_SLIDES.map((_,i) => (
                <motion.button key={i} onClick={() => goTo(i)}
                  animate={{ width: i===slide ? 24 : 8, background: i===slide ? '#fff' : 'rgba(255,255,255,.4)' }}
                  style={{ height:8, borderRadius:4, border:'none', cursor:'pointer', padding:0 }}/>
              ))}
            </div>
            <button className="hero-ctrl" onClick={nextSlide}><ChevronRight size={20}/></button>
          </div>
        </motion.div>

        {/* Search bar */}
        <div className="hero-search-wrap container">
          <SearchBar/>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      {stats && (
        <div className="stats-bar">
          <div className="container stats-grid">
            {[
              [stats.vehicles+'+ Vehicles', 'Premium Fleet'],
              [stats.customers?.toLocaleString()+'+', 'Happy Customers'],
              [stats.bookings?.toLocaleString()+'+', 'Completed Rentals'],
              [stats.branches, 'Locations'],
              ['4.9★', 'Average Rating'],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:'var(--primary)', marginBottom:4 }}>{val}</div>
                <div style={{ fontSize:'.75rem', color:'var(--text2)', textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span className="section-tag"><Car size={14}/> Our Fleet</span>
            <h2>Browse by Category</h2>
            <p style={{ color:'var(--text2)', marginTop:12, maxWidth:500, margin:'12px auto 0' }}>From economy to ultra-luxury — find the perfect vehicle for every occasion.</p>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*.07 }}>
                <Link to={`/vehicles?category=${cat.slug}`} className="cat-card">
                  <div className="cat-img" style={{ backgroundImage:`url(${cat.bg})` }}/>
                  <div className="cat-overlay" style={{ '--cat-color': cat.color }}/>
                  <div className="cat-content">
                    <div className="cat-icon">{cat.icon}</div>
                    <h3>{cat.label}</h3>
                    <p>{cat.desc}</p>
                    <span className="cat-cta">Explore <ChevronRight size={14}/></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VEHICLES ─────────────────────────────── */}
      <section className="section" style={{ background:'var(--surface2)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div>
              <span className="section-tag">✨ Top Picks</span>
              <h2>Featured Vehicles</h2>
            </div>
            <Link to="/vehicles" className="btn btn-outline btn-sm">View All <ArrowRight size={14}/></Link>
          </div>
          <div className="vehicles-grid">
            {featured.map((v,i) => <VehicleCard key={v.id} vehicle={v} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ── WHY US ────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
              <span className="section-tag">🏆 Why LUXEDRIVE</span>
              <h2 style={{ marginBottom:16 }}>Kenya's Most Trusted Car Rental Service</h2>
              <p style={{ color:'var(--text2)', marginBottom:32, lineHeight:1.8 }}>
                We've spent 5 years perfecting the car rental experience — from immaculate vehicles to seamless booking and outstanding customer support. Over 15,000 satisfied customers trust us for every journey.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {WHY_US.map((w, i) => (
                  <motion.div key={i} className="why-item card"
                    initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }}
                    viewport={{ once:true }} transition={{ delay:i*.1 }}
                    whileHover={{ x:6 }}>
                    <div className="why-icon" style={{ background:`${w.color}18`, color:w.color }}>{w.icon}</div>
                    <div>
                      <h3 style={{ fontSize:'1rem', marginBottom:4 }}>{w.title}</h3>
                      <p style={{ fontSize:'.875rem', color:'var(--text2)', lineHeight:1.6 }}>{w.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              style={{ position:'relative' }}>
              <img src="https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=700&q=85"
                alt="Premium Cars" style={{ width:'100%', borderRadius:24, objectFit:'cover', height:500 }}/>
              <motion.div className="why-float-card card"
                initial={{ scale:0.8, opacity:0 }} whileInView={{ scale:1, opacity:1 }}
                viewport={{ once:true }} transition={{ delay:.4 }}>
                <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:8, fontWeight:700 }}>Customer Rating</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, color:'var(--primary)' }}>4.9 / 5</div>
                <div style={{ display:'flex', gap:2, margin:'4px 0' }}>{[1,2,3,4,5].map(s=><Star key={s} size={14} fill="#f59e0b" color="#f59e0b"/>)}</div>
                <div style={{ fontSize:'.78rem', color:'var(--text2)' }}>Based on 2,400+ reviews</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="section" style={{ background:'var(--dark)', overflow:'hidden' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span className="section-tag" style={{ background:'rgba(255,255,255,.1)', color:'white' }}>💬 Reviews</span>
            <h2 style={{ color:'white' }}>What Our Customers Say</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="testimonial-card card-glass"
                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*.12 }}>
                <div style={{ display:'flex', gap:2, marginBottom:12 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#f59e0b" color="#f59e0b"/>)}
                </div>
                <p style={{ color:'rgba(255,255,255,.85)', lineHeight:1.75, marginBottom:20, fontSize:'.9rem' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, flexShrink:0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'white', fontSize:'.9rem' }}>{t.name}</div>
                    <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.5)' }}>{t.role} · {t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-bg"/>
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <motion.span className="section-tag" style={{ background:'rgba(255,255,255,.15)', color:'white', backdropFilter:'blur(8px)' }}
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
            🚀 Ready to Drive?
          </motion.span>
          <motion.h2 style={{ color:'white', marginBottom:16 }}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            Your Perfect Ride Awaits
          </motion.h2>
          <motion.p style={{ color:'rgba(255,255,255,.8)', maxWidth:480, margin:'0 auto 32px', lineHeight:1.8 }}
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:.15 }}>
            Join 15,000+ satisfied customers who choose LuxeDrive for every journey across Kenya.
          </motion.p>
          <motion.div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.25 }}>
            <Link to="/vehicles">
              <motion.span className="btn btn-white btn-xl" style={{ display:'inline-flex' }} whileHover={{ scale:1.04 }}>
                Browse All Cars <ArrowRight size={18}/>
              </motion.span>
            </Link>
            <a href="tel:+254700374830">
              <motion.span className="btn btn-xl" style={{ display:'inline-flex', border:'2px solid rgba(255,255,255,.4)', color:'white', padding:'18px 44px' }} whileHover={{ scale:1.02 }}>
                <Phone size={18}/> Call Us Now
              </motion.span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

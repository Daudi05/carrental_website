import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    title: 'Top 5 Road Trips to Take from Nairobi in 2025',
    excerpt: 'Kenya is a road tripper\'s paradise. From the Maasai Mara to the coastal highway, we\'ve picked the five best drives you can do in a weekend.',
    category: 'Travel Tips',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    author: 'Brian Muthomi',
    date: 'June 10, 2025',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 2,
    title: 'How to Choose the Right Car for Your Safari',
    excerpt: 'Not all cars are created equal when it comes to game drives. Here\'s our guide to picking the perfect vehicle for different safari terrains.',
    category: 'Car Guides',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    author: 'Amara Ochieng',
    date: 'May 28, 2025',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 3,
    title: 'What to Check Before Signing a Car Rental Agreement',
    excerpt: 'Renting a car comes with fine print. We break down the key things to verify before you drive off — from insurance to fuel policies.',
    category: 'Advice',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    author: 'David Kamau',
    date: 'May 15, 2025',
    readTime: '4 min read',
    featured: false,
  },
  {
    id: 4,
    title: 'Electric Vehicles in Kenya: The Future of Car Rental',
    excerpt: 'With Tesla and other EVs entering the Kenyan market, we explore what electric car rentals mean for travellers and the environment.',
    category: 'Industry News',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    author: 'Amara Ochieng',
    date: 'April 30, 2025',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 5,
    title: 'Nairobi to Mombasa: The Ultimate Road Trip Guide',
    excerpt: 'The Nairobi–Mombasa highway is one of Africa\'s great drives. We cover the best stops, fuel stations, and tips for a smooth journey.',
    category: 'Travel Tips',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    author: 'Brian Muthomi',
    date: 'April 12, 2025',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 6,
    title: 'SUV vs Sedan: Which Should You Rent in Kenya?',
    excerpt: 'City driving, upcountry trips, or coastal cruises — each demands a different vehicle. We compare SUVs and sedans across every use case.',
    category: 'Car Guides',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    author: 'David Kamau',
    date: 'March 25, 2025',
    readTime: '5 min read',
    featured: false,
  },
];

const CATEGORIES = ['All', 'Travel Tips', 'Car Guides', 'Advice', 'Industry News'];

const CAT_COLORS = {
  'Travel Tips':   { bg:'#fef3c7', color:'#d97706' },
  'Car Guides':    { bg:'#dbeafe', color:'#2563eb' },
  'Advice':        { bg:'#f0fdf4', color:'#16a34a' },
  'Industry News': { bg:'#f3e8ff', color:'#7c3aed' },
};

export default function Blog() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  const filtered = POSTS.filter(p => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find(p => p.featured);
  const rest     = filtered.filter(p => !p.featured);

  return (
    <div style={{ paddingTop:68, background:'#f8fafc', minHeight:'100vh' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ background:'#1e293b', padding:'72px 0 64px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(59,130,246,.18) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <motion.div className="container" style={{ position:'relative', zIndex:1 }} initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}>
          <span style={{ display:'inline-block', fontSize:'.72rem', fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#60a5fa', background:'rgba(96,165,250,.12)', border:'1px solid rgba(96,165,250,.3)', padding:'5px 16px', borderRadius:100, marginBottom:18 }}>
            DriveEase Journal
          </span>
          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:800, color:'white', marginBottom:16, lineHeight:1.1 }}>
            Stories, Tips &<br /><em style={{ fontStyle:'italic', color:'#60a5fa' }}>Road Wisdom</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,.65)', maxWidth:480, margin:'0 auto 36px', lineHeight:1.75 }}>
            Travel guides, car advice, and industry news from the DriveEase team.
          </p>
          {/* Search */}
          <div style={{ position:'relative', maxWidth:440, margin:'0 auto' }}>
            <Search size={16} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
            <input style={{ width:'100%', padding:'13px 16px 13px 44px', borderRadius:12, border:'1.5px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.08)', color:'white', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }}
              placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </motion.div>
      </div>

      <div className="container" style={{ padding:'56px 24px 80px' }}>

        {/* Category filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding:'7px 18px', borderRadius:100, border:`1.5px solid ${category===c ? '#3b82f6' : '#e2e8f0'}`, background: category===c ? '#3b82f6' : 'white', color: category===c ? 'white' : '#64748b', fontSize:'.82rem', fontWeight:600, cursor:'pointer', transition:'all .18s' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <motion.div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:0, borderRadius:20, overflow:'hidden', border:'1px solid #e2e8f0', background:'white', marginBottom:40, boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6 }}>
            <div style={{ overflow:'hidden', aspectRatio:'16/10' }}>
              <img src={featured.image} alt={featured.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .6s' }}/>
            </div>
            <div style={{ padding:'40px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'#3b82f6', background:'#eff6ff', padding:'4px 10px', borderRadius:100 }}>Featured</span>
                <span style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase', ...CAT_COLORS[featured.category], padding:'4px 10px', borderRadius:100 }}>{featured.category}</span>
              </div>
              <h2 style={{ fontSize:'1.5rem', marginBottom:14, lineHeight:1.3 }}>{featured.title}</h2>
              <p style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, marginBottom:24 }}>{featured.excerpt}</p>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, fontSize:'.78rem', color:'#94a3b8' }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={13}/>{featured.date}</span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={13}/>{featured.readTime}</span>
              </div>
              <Link to={`/blog/${featured.id}`} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#1e293b', color:'white', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:'.875rem', width:'fit-content' }}>
                Read Article <ArrowRight size={15}/>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Post grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {rest.map((post, i) => (
            <motion.div key={post.id} style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', transition:'box-shadow .2s, transform .2s' }}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}
              whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,.09)' }}>
              <div style={{ overflow:'hidden', aspectRatio:'16/10' }}>
                <img src={post.image} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }}/>
              </div>
              <div style={{ padding:24 }}>
                <span style={{ fontSize:'.68rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase', ...CAT_COLORS[post.category], padding:'3px 10px', borderRadius:100 }}>{post.category}</span>
                <h3 style={{ fontSize:'1rem', margin:'12px 0 8px', lineHeight:1.4 }}>{post.title}</h3>
                <p style={{ color:'#64748b', fontSize:'.82rem', lineHeight:1.65, marginBottom:16 }}>{post.excerpt.slice(0,100)}…</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:'.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:3 }}><Calendar size={11}/>{post.date}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/>{post.readTime}</span>
                  </div>
                  <Link to={`/blog/${post.id}`} style={{ fontSize:'.78rem', color:'#3b82f6', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    Read <ArrowRight size={13}/>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#94a3b8' }}>
            <Search size={48} style={{ margin:'0 auto 16px', opacity:.4 }}/>
            <h3 style={{ marginBottom:8 }}>No articles found</h3>
            <p style={{ fontSize:'.875rem' }}>Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,.7)', paddingTop: 64 }}>
      <div className="container" style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr 1.2fr', gap:48, paddingBottom:48 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
              <FaCar size={20}/>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:800, color:'white' }}>LuxeDrive</div>
              <div style={{ fontSize:'.6rem', letterSpacing:2, opacity:.6, textTransform:'uppercase' }}>Premium Car Rental</div>
            </div>
          </div>
          <p style={{ fontSize:'.875rem', lineHeight:1.8, maxWidth:280, marginBottom:20 }}>Kenya's premier car rental service offering premium vehicles, exceptional service, and unbeatable rates since 2020.</p>
          <div style={{ display:'flex', gap:10 }}>
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <a key={i} href="#" style={{ width:36, height:36, borderRadius:8, border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.6)', transition:'all .2s' }}
                onMouseEnter={e=>Object.assign(e.currentTarget.style,{background:'var(--primary)',borderColor:'var(--primary)',color:'white'})}
                onMouseLeave={e=>Object.assign(e.currentTarget.style,{background:'transparent',borderColor:'rgba(255,255,255,.15)',color:'rgba(255,255,255,.6)'})}>
                <Icon size={16}/>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontFamily:'var(--font)', fontSize:'.72rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Services</h4>
          {['Browse Vehicles','Airport Pickup','Long Term Rental','Corporate Rentals','Chauffeur Service'].map(l=>(
            <div key={l}><Link to="/vehicles" style={{ display:'block', fontSize:'.875rem', padding:'5px 0', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}>{l}</Link></div>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:'var(--font)', fontSize:'.72rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Company</h4>
          {[['About Us','/about'],['Careers','#'],['Press','#'],['Blog','#'],['Contact','/contact']].map(([l,to])=>(
            <div key={l}><Link to={to} style={{ display:'block', fontSize:'.875rem', padding:'5px 0', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}>{l}</Link></div>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:'var(--font)', fontSize:'.72rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Contact</h4>
          {[
            [FaPhone, '+254 700 DRIVE (37483)', 'tel:+254700374830'],
            [FaEnvelope, 'hello@luxedrive.co.ke', 'mailto:hello@luxedrive.co.ke'],
            [FaMapMarkerAlt, 'Kimathi St, Nairobi CBD, Kenya', null],
          ].map(([Icon, text, href]) => (
            <div key={text} style={{ display:'flex', gap:10, padding:'6px 0', fontSize:'.875rem' }}>
              <Icon size={15} color="var(--primary)" style={{ flexShrink:0, marginTop:2 }}/>
              {href ? <a href={href} style={{ transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}>{text}</a>
                    : <span>{text}</span>}
            </div>
          ))}
          <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(255,255,255,.05)', borderRadius:10, fontSize:'.78rem' }}>
            <strong style={{ color:'white', display:'block', marginBottom:4 }}>24/7 Support</strong>
            Mon–Sun: Always available
          </div>
        </div>
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', padding:'16px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, fontSize:'.78rem', color:'rgba(255,255,255,.35)' }}>
          <span>© 2025 LuxeDrive Ltd. All rights reserved. Registered in Kenya.</span>
          <div style={{ display:'flex', gap:20 }}>
            <Link to="#" style={{ transition:'color .2s' }}>Privacy Policy</Link>
            <Link to="#" style={{ transition:'color .2s' }}>Terms of Service</Link>
            <Link to="#" style={{ transition:'color .2s' }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

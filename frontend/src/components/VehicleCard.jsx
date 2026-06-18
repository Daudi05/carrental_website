import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Users, Fuel, Settings, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';

export default function VehicleCard({ vehicle, index = 0 }) {
  const [wishlisted, setWishlisted] = useState(false);

  const statusColor = {
    available:   'badge-available',
    rented:      'badge-rented',
    maintenance: 'badge-maintenance',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      style={{ height: '100%' }}
    >
      <div className="vehicle-card card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--surface2)' }}>
          {vehicle.primary_image ? (
            <img src={vehicle.primary_image} alt={vehicle.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>🚗</div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className={`badge ${statusColor[vehicle.status] || 'badge-gray'}`}>{vehicle.status}</span>
          </div>
          {vehicle.is_featured && (
            <div style={{ position: 'absolute', top: 12, right: 48, background: 'var(--accent)', color: 'white', fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 100 }}>Featured</div>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => { e.preventDefault(); setWishlisted(!wishlisted); }}
          >
            <Heart size={15} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#64748b'} />
          </motion.button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 5 }}>
            {vehicle.category?.name}
          </div>
          <h3 style={{ fontSize: '1rem', marginBottom: 8, lineHeight: 1.3 }}>{vehicle.name}</h3>

          {/* Specs row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              [Users, vehicle.seats ? `${vehicle.seats} seats` : null],
              [Fuel, vehicle.fuel_type],
              [Settings, vehicle.transmission],
            ].filter(([, v]) => v).map(([Icon, val], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', color: 'var(--text2)' }}>
                <Icon size={13} color="var(--text3)" />
                <span style={{ textTransform: 'capitalize' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          {vehicle.total_reviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{vehicle.rating}</span>
              <span style={{ fontSize: '.75rem', color: 'var(--text3)' }}>({vehicle.total_reviews} reviews)</span>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                ${vehicle.daily_rate}
              </span>
              <span style={{ fontSize: '.75rem', color: 'var(--text3)' }}>/day</span>
            </div>
            <Link to={`/vehicles/${vehicle.id}`}>
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: .97 }}
                className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                View Details
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

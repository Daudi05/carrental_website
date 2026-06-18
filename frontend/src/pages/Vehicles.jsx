import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, X, ChevronDown, Grid2X2, List } from 'lucide-react';
import { vehiclesApi } from '../services/api';
import VehicleCard from '../components/VehicleCard';

const FUEL_TYPES = ['petrol','diesel','electric','hybrid'];
const TRANSMISSIONS = ['automatic','manual'];
const SORT_OPTIONS = [
  { value:'newest', label:'Newest First' },
  { value:'price_asc', label:'Price: Low to High' },
  { value:'price_desc', label:'Price: High to Low' },
  { value:'rating', label:'Highest Rated' },
  { value:'popular', label:'Most Popular' },
];

export default function Vehicles() {
  const [params, setParams]   = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCats]  = useState([]);
  const [pagination, setPag]   = useState(null);
  const [loading, setLoading]  = useState(true);
  const [sidebarOpen, setSidebar] = useState(false);

  const [filters, setFilters] = useState({
    category:     params.get('category') || '',
    search:       params.get('search')   || '',
    fuel_type:    '',
    transmission: '',
    min_price:    '',
    max_price:    '',
    seats:        '',
    sort:         'newest',
    page:         1,
    pickup_date:  params.get('pickup_date') || '',
    return_date:  params.get('return_date') || '',
  });

  useEffect(() => {
    vehiclesApi.categories().then(r => setCats(r.data.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      Object.entries(filters).forEach(([k,v]) => { if(v) p[k] = v; });
      const res = await vehiclesApi.list(p);
      setVehicles(res.data.data);
      setPag(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const clearFilters = () => setFilters(f => ({
    ...f, category:'', search:'', fuel_type:'', transmission:'',
    min_price:'', max_price:'', seats:'', sort:'newest', page:1
  }));

  const activeFilters = ['category','search','fuel_type','transmission','min_price','max_price','seats']
    .filter(k => filters[k]).length;

  return (
    <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', background: 'var(--surface2)' }}>
      {/* Page header */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', padding:'24px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'1.5rem', marginBottom:4 }}>Browse Vehicles</h1>
            <p style={{ color:'var(--text2)', fontSize:'.875rem' }}>{pagination?.total || 0} vehicles available</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
              <input className="form-input" style={{ paddingLeft:38, width:240 }} placeholder="Search vehicles…"
                value={filters.search} onChange={e => setFilter('search', e.target.value)} />
            </div>
            <select className="form-input" style={{ width:'auto' }} value={filters.sort}
              onChange={e => setFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => setSidebar(!sidebarOpen)}>
              <SlidersHorizontal size={15}/> Filters {activeFilters > 0 && <span className="badge badge-info" style={{ fontSize:'.65rem' }}>{activeFilters}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px 80px', display:'grid', gridTemplateColumns: sidebarOpen ? '280px 1fr' : '1fr', gap:28 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <motion.aside initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            style={{ position:'sticky', top: 'calc(var(--nav-height) + 24px)', alignSelf:'start' }}>
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <strong>Filters</strong>
                {activeFilters > 0 && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
              </div>

              {/* Category */}
              <div style={{ marginBottom:22 }}>
                <div className="form-label">Category</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  <button className={`btn btn-sm ${!filters.category ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('category','')}>All</button>
                  {categories.map(c => (
                    <button key={c.id} className={`btn btn-sm ${filters.category===c.slug ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setFilter('category', c.slug)}>{c.icon} {c.name}</button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom:22 }}>
                <div className="form-label">Price per Day (USD)</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <input className="form-input" placeholder="Min $" type="number" value={filters.min_price}
                    onChange={e => setFilter('min_price', e.target.value)} />
                  <input className="form-input" placeholder="Max $" type="number" value={filters.max_price}
                    onChange={e => setFilter('max_price', e.target.value)} />
                </div>
              </div>

              {/* Fuel */}
              <div style={{ marginBottom:22 }}>
                <div className="form-label">Fuel Type</div>
                <select className="form-input" value={filters.fuel_type} onChange={e => setFilter('fuel_type', e.target.value)}>
                  <option value="">Any</option>
                  {FUEL_TYPES.map(f => <option key={f} value={f} style={{ textTransform:'capitalize' }}>{f}</option>)}
                </select>
              </div>

              {/* Transmission */}
              <div style={{ marginBottom:22 }}>
                <div className="form-label">Transmission</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['', ...TRANSMISSIONS].map(t => (
                    <button key={t} className={`btn btn-sm ${filters.transmission===t ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setFilter('transmission', t)} style={{ flex:1, textTransform:'capitalize' }}>
                      {t || 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seats */}
              <div>
                <div className="form-label">Min Seats</div>
                <select className="form-input" value={filters.seats} onChange={e => setFilter('seats', e.target.value)}>
                  <option value="">Any</option>
                  {[2,4,5,7,9].map(s => <option key={s} value={s}>{s}+ seats</option>)}
                </select>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Results */}
        <main>
          {loading ? (
            <div className="page-loader"><div className="spinner"/><span>Loading vehicles…</span></div>
          ) : vehicles.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text2)' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🚗</div>
              <h3>No vehicles found</h3>
              <p>Try adjusting your filters</p>
              <button className="btn btn-outline" style={{ marginTop:16 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${sidebarOpen ? 3 : 4},1fr)`, gap:22 }}>
                {vehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i}/>)}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:48 }}>
                  <button className="btn btn-outline btn-sm" disabled={!pagination.has_prev}
                    onClick={() => setFilter('page', filters.page - 1)}>← Previous</button>
                  <span style={{ fontSize:'.875rem', color:'var(--text2)' }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button className="btn btn-outline btn-sm" disabled={!pagination.has_next}
                    onClick={() => setFilter('page', filters.page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

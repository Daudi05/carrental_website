import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load all pages
const Home          = lazy(() => import('./pages/Home'));
const Vehicles      = lazy(() => import('./pages/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const AdminLayout   = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard= lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminCustomers= lazy(() => import('./pages/admin/AdminCustomers'));
const Contact       = lazy(() => import('./pages/Contact'));
const About         = lazy(() => import('./pages/About'));
const Blog          = lazy(() => import('./pages/Blog'));
const Locations = lazy(() => import('./pages/Locations'));




const Loader = () => (
  <div className="page-loader" style={{ minHeight:'100vh' }}>
    <div className="spinner" style={{ width:32, height:32, borderWidth:3 }}/>
    <span style={{ color:'var(--text2)', fontSize:'.875rem' }}>Loading…</span>
  </div>
);

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace/>;
}

function AdminGuard({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)      return <Navigate to="/login" replace/>;
  if (!isAdmin()) return <Navigate to="/" replace/>;
  return children;
}

function WithLayout({ children, noFooter = false }) {
  return (
    <>
      <Navbar/>
      {children}
      {!noFooter && <Footer/>}
    </>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loader/>}>
      <Routes>
        {/* Public with layout */}
        <Route path="/" element={<WithLayout><Home/></WithLayout>}/>
        <Route path="/vehicles" element={<WithLayout><Vehicles/></WithLayout>}/>
        <Route path="/vehicles/:id" element={<WithLayout><VehicleDetail/></WithLayout>}/>
        <Route path="/about" element={<WithLayout><About /></WithLayout>} />
        <Route path="/contact" element={<WithLayout><Contact /></WithLayout>} />
        <Route path="/blog" element={<WithLayout><Blog /></WithLayout>} />
        <Route path="/locations" element={<WithLayout><Locations /></WithLayout>}/>

        {/* Auth — no navbar/footer */}
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        {/* Protected customer */}
        <Route path="/dashboard" element={<Protected><WithLayout noFooter><Dashboard/></WithLayout></Protected>}/>
        

        {/* Admin */}
        <Route path="/admin" element={<AdminGuard><AdminLayout/></AdminGuard>}>
          <Route index    element={<AdminDashboard/>}/>
          <Route path="vehicles"  element={<AdminVehicles/>}/>
          <Route path="bookings"  element={<AdminBookings/>}/>
          <Route path="customers" element={<AdminCustomers/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes/>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

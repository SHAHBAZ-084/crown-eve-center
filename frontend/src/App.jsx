// frontend/src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Shop = lazy(() => import('./pages/shop/Shop'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const Appointments = lazy(() => import('./pages/appointments/Appointments'));
const TrackOrder = lazy(() => import('./pages/public/TrackOrder'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Forgot = lazy(() => import('./pages/auth/Forgot'));

// Dashboards - Owner
const OwnerLayout = lazy(() => import('./components/owner/OwnerLayout'));
const OwnerDashboard = lazy(() => import('./pages/dashboards/owner/Dashboard'));
const OwnerBranches = lazy(() => import('./pages/dashboards/owner/Branches'));
const OwnerParts = lazy(() => import('./pages/dashboards/owner/Parts'));
const OwnerUsers = lazy(() => import('./pages/dashboards/owner/Users'));
const OwnerReports = lazy(() => import('./pages/dashboards/owner/Reports'));
const OwnerSettings = lazy(() => import('./pages/dashboards/owner/Settings'));
const OwnerOrders = lazy(() => import('./pages/dashboards/owner/Orders'));
const OwnerPurchases = lazy(() => import('./pages/dashboards/owner/Purchases'));

// Dashboards - Branch
const BranchLayout = lazy(() => import('./components/branch/BranchLayout'));
const BranchDashboard = lazy(() => import('./pages/dashboards/branch/Dashboard'));
const BranchProducts = lazy(() => import('./pages/dashboards/branch/Products'));
const BranchInventory = lazy(() => import('./pages/dashboards/branch/Inventory'));
const BranchOrders = lazy(() => import('./pages/dashboards/branch/Orders'));
const BranchServices = lazy(() => import('./pages/dashboards/branch/Services'));
const BranchAppointments = lazy(() => import('./pages/dashboards/branch/Appointments'));
const BranchSuppliers = lazy(() => import('./pages/dashboards/branch/Suppliers'));
const BranchEmployees = lazy(() => import('./pages/dashboards/branch/Employees'));
const BranchReports = lazy(() => import('./pages/dashboards/branch/Reports'));

// Dashboards - Employee & Technician
const EmployeeDashboard = lazy(() => import('./pages/dashboards/EmployeeDashboard'));
const POS = lazy(() => import('./pages/dashboards/employee/POS'));
const EmployeeOrders = lazy(() => import('./pages/dashboards/employee/EmployeeOrders'));
const EmployeeServices = lazy(() => import('./pages/dashboards/employee/EmployeeServices'));
const TechnicianDashboard = lazy(() => import('./pages/dashboards/TechnicianDashboard'));

// Customer Portal
const CustomerLayout = lazy(() => import('./components/customer/CustomerLayout'));
const CustomerDashboard = lazy(() => import('./pages/dashboards/customer/Dashboard'));
const CustomerOrders = lazy(() => import('./pages/dashboards/customer/Orders'));
const CustomerBookings = lazy(() => import('./pages/dashboards/customer/Bookings'));
const CustomerProfile = lazy(() => import('./pages/dashboards/customer/Profile'));
const CustomerShop = lazy(() => import('./pages/dashboards/customer/Shop'));
const CustomerCart = lazy(() => import('./pages/dashboards/customer/Cart'));
const CustomerCheckout = lazy(() => import('./pages/dashboards/customer/Checkout'));
const CustomerTrack = lazy(() => import('./pages/dashboards/customer/TrackOrder'));

const FullPageSkeleton = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<FullPageSkeleton />}>
          <Routes>
            <Route element={<Layout isPublic />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/track/:id" element={<TrackOrder />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/appointments" element={<Appointments />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />

            {/* Owner App Shell - TEMPORARILY OPEN FOR TESTING */}
            <Route element={<OwnerLayout />}>
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/branches"  element={<OwnerBranches />} />
              <Route path="/owner/parts"     element={<OwnerParts />} />
              <Route path="/owner/users"     element={<OwnerUsers />} />
              <Route path="/owner/reports"   element={<OwnerReports />} />
              <Route path="/owner/settings"  element={<OwnerSettings />} />
              <Route path="/owner/orders"    element={<OwnerOrders />} />
              <Route path="/owner/purchases" element={<OwnerPurchases />} />
            </Route>
            
            {/* Branch Routes - Outside main Layout to avoid double sidebar */}
            <Route element={<ProtectedRoute allowedRoles={['BRANCH_OWNER']}><BranchLayout /></ProtectedRoute>}>
              <Route path="/branch/dashboard"    element={<BranchDashboard />} />
              <Route path="/branch/products"     element={<BranchProducts />} />
              <Route path="/branch/inventory"    element={<BranchInventory />} />
              <Route path="/branch/orders"       element={<BranchOrders />} />
              <Route path="/branch/services"     element={<BranchServices />} />
              <Route path="/branch/appointments" element={<BranchAppointments />} />
              <Route path="/branch/suppliers"    element={<BranchSuppliers />} />
              <Route path="/branch/employees"    element={<BranchEmployees />} />
              <Route path="/branch/reports"      element={<BranchReports />} />
            </Route>

            {/* Customer Portal - Premium Dashboard Shell */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout /></ProtectedRoute>}>
              <Route path="/my/dashboard" element={<CustomerDashboard />} />
              <Route path="/my/orders"    element={<CustomerOrders />} />
              <Route path="/my/bookings"  element={<CustomerBookings />} />
              <Route path="/my/profile"   element={<CustomerProfile />} />
              <Route path="/shop"         element={<CustomerShop />} />
              <Route path="/cart"         element={<CustomerCart />} />
              <Route path="/checkout"     element={<CustomerCheckout />} />
              <Route path="/track/:id"    element={<CustomerTrack />} />
            </Route>

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Employee Routes */}
              <Route path="/emp/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/emp/pos"       element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><POS /></ProtectedRoute>} />
              <Route path="/emp/orders"    element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeOrders /></ProtectedRoute>} />
              <Route path="/emp/services"  element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'TECHNICIAN']}><EmployeeServices /></ProtectedRoute>} />
            </Route>

            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import QRGenerator from "./pages/QRGenerator";
import CustomerMenu from "./pages/CustomerMenu";
import Pricing from "./pages/Pricing";
import AdminHonorarySubscriptions from "./pages/admin/AdminHonorarySubscriptions";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminSubscriptionOrders from "./pages/admin/AdminSubscriptionOrders";
import Settings from "./pages/Settings";
import MenuDesign from "./pages/MenuDesign";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// New Restaurant System Pages
import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantSignup from "./pages/RestaurantSignup";
import TableManagement from "./pages/TableManagement";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import RestaurantSetup from "./pages/RestaurantSetup";
import RestaurantsManagement from "./pages/RestaurantsManagement";
import MenuManagementNew from "./pages/MenuManagementNew";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import AdminSubscriptionApproval from "./pages/admin/AdminSubscriptionApproval";

import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DynamicRestaurantMenu from "./pages/DynamicRestaurantMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RBACProvider>
        <Routes>
          {/* Public routes (no authentication required) */}
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Dynamic menu route (public) */}
          <Route path="/:restaurantSlug/:tableName" element={<DynamicRestaurantMenu />} />

          {/* Authentication routes */}
          <Route path="/signin" element={<RestaurantLogin />} />
          <Route path="/signup" element={<RestaurantSignup />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          
          {/* Protected Restaurant Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/menu" element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          } />
          <Route path="/tables" element={
            <ProtectedRoute>
              <TableManagement />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/menu-design" element={
            <ProtectedRoute>
              <MenuDesign />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/qr-codes" element={
            <ProtectedRoute>
              <QRGenerator />
            </ProtectedRoute>
          } />
          <Route path="/restaurants" element={
            <ProtectedRoute>
              <RestaurantsManagement />
            </ProtectedRoute>
          } />
          <Route path="/menu-new" element={
            <ProtectedRoute>
              <MenuManagementNew />
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <SubscriptionManagement />
            </ProtectedRoute>
          } />
          <Route path="/order/:restaurantId/:tableName" element={<DynamicRestaurantMenu />} />
          
          {/* Admin Routes - Now using RBAC */}
          <Route path="/admin/home" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscription-orders" element={
            <ProtectedRoute adminOnly={true}>
              <AdminSubscriptionOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/honorary-subscriptions" element={
            <ProtectedRoute adminOnly={true}>
              <AdminHonorarySubscriptions />
            </ProtectedRoute>
          } />
          <Route path="/admin/restaurants" element={
            <ProtectedRoute adminOnly={true}>
              <AdminRestaurants />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment-methods" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPaymentMethods />
            </ProtectedRoute>
          } />
          <Route path="/admin/packages" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPackages />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscription-approval" element={
            <ProtectedRoute adminOnly={true}>
              <AdminSubscriptionApproval />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route - MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </RBACProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
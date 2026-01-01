import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import TripDetails from "./pages/TripDetails";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import BookingPayment from "./pages/BookingPayment";
import BookingConfirmation from "./pages/BookingConfirmation";
import Companies from "./pages/Companies";
import CompanyRegister from "./pages/CompanyRegister";
import Dashboard from "./pages/company/Dashboard";
import Overview from "./pages/company/Overview";
import Buses from "./pages/company/Buses";
import RoutesPage from "./pages/company/Routes";
import Trips from "./pages/company/Trips";
import Bookings from "./pages/company/Bookings";
import Settings from "./pages/company/Settings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOverview from "./pages/admin/Overview";
import AdminCompanies from "./pages/admin/Companies";
import AdminUsers from "./pages/admin/Users";
import AdminBookings from "./pages/admin/Bookings";
import AdminAnalytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/booking/:id/payment" element={<BookingPayment />} />
            <Route path="/booking/:id/confirmation" element={<BookingConfirmation />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/register" element={<CompanyRegister />} />
            <Route path="/company/login" element={<CompanyRegister />} />
            <Route path="/company/dashboard" element={<Dashboard />}>
              <Route index element={<Overview />} />
              <Route path="buses" element={<Buses />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="trips" element={<Trips />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

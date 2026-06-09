import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FreeListingsBanner from './components/layout/FreeListingsBanner'
import ScrollToTop from './components/common/ScrollToTop'

import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

import MapViewPage from './pages/MapViewPage'
import SubmitPropertyPage from './pages/SubmitPropertyPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import MyPropertiesPage from './pages/MyPropertiesPage'
import NotFoundPage from './pages/NotFoundPage'
import { LegacyPropertyRedirect, LegacyLocationRedirect } from './components/common/LegacyRedirects'
import RequireAdmin from './components/auth/RequireAdmin'
import RequireStaff from './components/auth/RequireStaff'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHomeRoute from './pages/admin/AdminHomeRoute'
import MyWorkPage from './pages/admin/MyWorkPage'
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage'
import AddPropertyPage from './pages/admin/AddPropertyPage'
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage'
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminSmsTemplatesPage from './pages/admin/AdminSmsTemplatesPage'
import AdminVideoListingsPage from './pages/admin/AdminVideoListingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
})

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <FreeListingsBanner />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/properties"
              element={
                <PublicLayout>
                  <PropertiesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/rentals"
              element={
                <PublicLayout>
                  <PropertiesPage rentalMode />
                </PublicLayout>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <PublicLayout>
                  <PropertyDetailPage />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <AboutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              }
            />
            <Route
              path="/map"
              element={
                <PublicLayout>
                  <MapViewPage />
                </PublicLayout>
              }
            />
            <Route
              path="/sell"
              element={
                <PublicLayout>
                  <SubmitPropertyPage />
                </PublicLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <PublicLayout>
                  <ProfilePage />
                </PublicLayout>
              }
            />
            <Route
              path="/favorites"
              element={
                <PublicLayout>
                  <FavoritesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/my-properties"
              element={
                <PublicLayout>
                  <MyPropertiesPage />
                </PublicLayout>
              }
            />

            {/* The /admin layout itself is open to both Admin and Employee
                accounts (RequireStaff). Admin-only routes are individually
                gated by RequireAdmin inside the element prop — Employees
                only get through to /admin/my-work. */}
            <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
              {/* /admin → Admin sees Dashboard, Employee gets redirected to
                  /admin/my-work. Avoids the access-denied screen when an
                  Employee clicks the logo, types the URL, or follows a
                  link to /admin from elsewhere in the site. */}
              <Route index element={<AdminHomeRoute />} />
              <Route path="my-work" element={<MyWorkPage />} />
              <Route path="properties" element={<RequireAdmin><AdminPropertiesPage /></RequireAdmin>} />
              <Route path="video-listings" element={<RequireAdmin><AdminVideoListingsPage /></RequireAdmin>} />
              <Route path="add-property" element={<RequireAdmin><AddPropertyPage /></RequireAdmin>} />
              {/* Pending properties — shared. Admins see the full queue with
                  approve/reject + assign powers; Employees see only the
                  properties assigned to them to verify, with those actions
                  hidden. */}
              <Route path="pending" element={<RequireStaff><PendingApprovalsPage /></RequireStaff>} />
              <Route path="pending/:id" element={<RequireStaff><PendingApprovalsPage /></RequireStaff>} />
              <Route path="edit-property/:id" element={<RequireAdmin><AddPropertyPage /></RequireAdmin>} />
              <Route path="testimonials" element={<RequireAdmin><AdminTestimonialsPage /></RequireAdmin>} />
              <Route path="users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              {/* Inquiries page is shared — AdminInquiriesPage detects the
                  current role and fetches /inquiries (admin) or
                  /inquiries/mine (employee), hiding admin-only controls
                  for the employee variant. */}
              <Route path="inquiries" element={<RequireStaff><AdminInquiriesPage /></RequireStaff>} />
              <Route path="settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
              <Route path="sms-templates" element={<RequireAdmin><AdminSmsTemplatesPage /></RequireAdmin>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ── Legacy WordPress (Estatik) URL redirects ──
                Google still has the old URL structure indexed from before the
                React rebuild. Forward each pattern to its modern equivalent so
                search visitors land on real content instead of a soft-404, and
                Google consolidates the old URLs onto the new ones. IDs were
                preserved in the DB migration. */}
            <Route path="/property/:id" element={<LegacyPropertyRedirect />} />
            <Route path="/property/:id/*" element={<LegacyPropertyRedirect />} />
            <Route path="/location/:slug" element={<LegacyLocationRedirect />} />
            <Route path="/location/:slug/*" element={<LegacyLocationRedirect />} />
            <Route path="/property-city/:slug" element={<LegacyLocationRedirect />} />
            <Route path="/property-city/:slug/*" element={<LegacyLocationRedirect />} />

            {/* Catch-all 404 — must be last */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFoundPage />
                </PublicLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import RequireAdmin from './components/auth/RequireAdmin'
import RequireStaff from './components/auth/RequireStaff'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
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
              <Route index element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
              <Route path="my-work" element={<MyWorkPage />} />
              <Route path="properties" element={<RequireAdmin><AdminPropertiesPage /></RequireAdmin>} />
              <Route path="video-listings" element={<RequireAdmin><AdminVideoListingsPage /></RequireAdmin>} />
              <Route path="add-property" element={<RequireAdmin><AddPropertyPage /></RequireAdmin>} />
              <Route path="pending" element={<RequireAdmin><PendingApprovalsPage /></RequireAdmin>} />
              <Route path="pending/:id" element={<RequireAdmin><PendingApprovalsPage /></RequireAdmin>} />
              <Route path="edit-property/:id" element={<RequireAdmin><AddPropertyPage /></RequireAdmin>} />
              <Route path="testimonials" element={<RequireAdmin><AdminTestimonialsPage /></RequireAdmin>} />
              <Route path="users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
              <Route path="inquiries" element={<RequireAdmin><AdminInquiriesPage /></RequireAdmin>} />
              <Route path="settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
              <Route path="sms-templates" element={<RequireAdmin><AdminSmsTemplatesPage /></RequireAdmin>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

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
  )
}

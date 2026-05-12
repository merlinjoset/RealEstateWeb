import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/common/ScrollToTop'

import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import MapViewPage from './pages/MapViewPage'
import SubmitPropertyPage from './pages/SubmitPropertyPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import MyPropertiesPage from './pages/MyPropertiesPage'
import NotFoundPage from './pages/NotFoundPage'
import RequireAdmin from './components/auth/RequireAdmin'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
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

            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="video-listings" element={<AdminVideoListingsPage />} />
              <Route path="add-property" element={<AddPropertyPage />} />
              <Route path="pending" element={<PendingApprovalsPage />} />
              <Route path="pending/:id" element={<PendingApprovalsPage />} />
              <Route path="edit-property/:id" element={<AddPropertyPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="inquiries" element={<AdminInquiriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="sms-templates" element={<AdminSmsTemplatesPage />} />
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

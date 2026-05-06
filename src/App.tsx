import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import MapViewPage from './pages/MapViewPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage'
import AddPropertyPage from './pages/admin/AddPropertyPage'
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage'
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

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

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="add-property" element={<AddPropertyPage />} />
              <Route path="pending" element={<PendingApprovalsPage />} />
              <Route path="pending/:id" element={<PendingApprovalsPage />} />
              <Route path="edit-property/:id" element={<AddPropertyPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="inquiries" element={<AdminInquiriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

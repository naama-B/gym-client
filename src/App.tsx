import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SessionsPage } from './pages/SessionsPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminSessionsPage } from './pages/admin/AdminSessionsPage'
import { AdminClassTypesPage } from './pages/admin/AdminClassTypesPage'
import { AdminInstructorsPage } from './pages/admin/AdminInstructorsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/classes" replace />} />
          <Route path="classes" element={<SessionsPage />} />
          <Route path="classes/:id" element={<SessionDetailPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />

          <Route path="admin" element={<ProtectedRoute adminOnly />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/sessions" replace />} />
              <Route path="sessions" element={<AdminSessionsPage />} />
              <Route path="class-types" element={<AdminClassTypesPage />} />
              <Route path="instructors" element={<AdminInstructorsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoadingBlock } from './components/ui/Spinner'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SessionsPage } from './pages/SessionsPage'
import { NotFoundPage } from './pages/NotFoundPage'

const SessionDetailPage = lazy(() =>
  import('./pages/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
)
const MyBookingsPage = lazy(() =>
  import('./pages/MyBookingsPage').then((m) => ({ default: m.MyBookingsPage })),
)
const ReviewsPage = lazy(() =>
  import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })),
)
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminSessionsPage = lazy(() =>
  import('./pages/admin/AdminSessionsPage').then((m) => ({ default: m.AdminSessionsPage })),
)
const AdminClassTypesPage = lazy(() =>
  import('./pages/admin/AdminClassTypesPage').then((m) => ({ default: m.AdminClassTypesPage })),
)
const AdminInstructorsPage = lazy(() =>
  import('./pages/admin/AdminInstructorsPage').then((m) => ({ default: m.AdminInstructorsPage })),
)

export default function App() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/classes" replace />} />
            <Route path="classes" element={<SessionsPage />} />
            <Route path="classes/:id" element={<SessionDetailPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
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
    </Suspense>
  )
}


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { useThemeStore } from './store/themeStore';

// Admin pages
import { LabsPage as AdminLabsPage } from './pages/admin/LabsPage';
import { ComponentsPage } from './pages/admin/ComponentsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { HierarchyPage } from './pages/admin/HierarchyPage';
import { AllBookingsPage } from './pages/admin/AllBookingsPage';

// Student pages
import { LabsPage as StudentLabsPage } from './pages/student/LabsPage';
import { LabComponentsPage } from './pages/student/LabComponentsPage';
import { MyBookingsPage } from './pages/student/MyBookingsPage';

// Application Management pages
import { NewApplicationPage } from './pages/applications/NewApplicationPage';
import { MyApplicationsPage } from './pages/applications/MyApplicationsPage';
import { ReviewQueuePage } from './pages/applications/ReviewQueuePage';
import { ReviewHistoryPage } from './pages/applications/ReviewHistoryPage';
import { ApplicationDetailPage } from './pages/applications/ApplicationDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function App() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Admin */}
              <Route path="/admin/labs" element={<AdminLabsPage />} />
              <Route path="/admin/components" element={<ComponentsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/bookings" element={<AllBookingsPage />} />
              <Route path="/admin/hierarchy" element={<HierarchyPage />} />

              {/* Student */}
              <Route path="/student/labs" element={<StudentLabsPage />} />
              <Route path="/student/lab/:labId" element={<LabComponentsPage />} />
              <Route path="/student/bookings" element={<MyBookingsPage />} />

              {/* Application Management */}
              <Route path="/applications/new" element={<NewApplicationPage />} />
              <Route path="/applications/my" element={<MyApplicationsPage />} />
              <Route path="/applications/review" element={<ReviewQueuePage />} />
              <Route path="/applications/all" element={<ReviewQueuePage />} />
              <Route path="/applications/history" element={<ReviewHistoryPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailPage />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-fg)',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: 'var(--shadow-lg)',
          }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

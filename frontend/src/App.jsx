import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts';
import { ProtectedRoute } from './components/auth';
import { MainLayout } from './components/layout';

// Pages
import { LoginPage } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { StudentsListPage } from './features/students';
import { StaffListPage } from './features/staff';
import { AttendanceDashboard } from './features/attendance';
import { PaymentListPage } from './features/payments';
import { BranchList } from './features/branches';
import { ReportsDashboard } from './features/reports';
import { SettingsPage } from './features/settings';
import { AIAssistant } from './features/ai-tools';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Placeholder page for modules under construction
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-2">This module is under development</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsListPage />} />
              <Route path="/staff" element={<StaffListPage />} />
              <Route path="/attendance" element={<AttendanceDashboard />} />
              <Route path="/payments" element={<PaymentListPage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/branches" element={<BranchList />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/ai-tools" element={<AIAssistant />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-slate-300">404</h1>
                    <p className="text-slate-600 mt-4">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

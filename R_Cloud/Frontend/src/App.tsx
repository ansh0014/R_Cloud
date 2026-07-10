import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import { AuthPage } from './components/ui/animated-characters-login-page';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import UserOverview from './pages/dashboard/UserOverview';
import DeploymentsPage from './pages/dashboard/DeploymentsPage';
import AgentMetrics from './pages/dashboard/AgentMetrics';
import TracesPage from './pages/dashboard/TracesPage';
import LogsPage from './pages/dashboard/LogsPage';
import TokenUsagePage from './pages/dashboard/TokenUsagePage';
import AdminOverview from './pages/admin/AdminOverview';
import SystemControls from './pages/admin/SystemControls';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <div className="relative min-h-screen w-full overflow-x-hidden">
                <Navbar />
                <HeroSection />
              </div>
            }
          />
          <Route path="/login" element={<AuthPage mode="signin" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />

          {/* Protected User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserOverview />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="agents" element={<AgentMetrics />} />
            <Route path="traces" element={<TracesPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="tokens" element={<TokenUsagePage />} />
          </Route>

          {/* Protected Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="controls" element={<SystemControls />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

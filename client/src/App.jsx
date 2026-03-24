import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileStack, LayoutDashboard, LogOut, Moon, Sun, User } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardManager from './pages/DashboardManager.jsx';
import OnboardingForm from './pages/OnboardingForm.jsx';
import DocumentUpload from './pages/DocumentUpload.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner label="Loading…" />
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'manager' ? '/manager-dashboard' : '/dashboard'} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const dashboardPath = user?.role === 'manager' ? '/manager-dashboard' : '/dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      {!isAuthPage && (
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/80"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold tracking-tight text-slate-900 transition-colors dark:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs text-white shadow-md shadow-violet-500/25">
                OX
              </span>
              <span>OnboardX</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-2">
              {user && (
                <>
                  <span
                    className="hidden max-w-[140px] truncate text-slate-500 dark:text-slate-400 sm:inline"
                    title={user.email}
                  >
                    {user.name}
                    <span className="text-slate-400 dark:text-slate-500"> · {user.role}</span>
                  </span>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-violet-400"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.role === 'manager' ? 'Team' : 'Dashboard'}</span>
                  </Link>
                  {user.role === 'employee' && (
                    <>
                      <Link
                        to="/employee/onboarding"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-violet-400"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                      </Link>
                      <Link
                        to="/employee/documents"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-violet-400"
                      >
                        <FileStack className="h-4 w-4" />
                        <span className="hidden sm:inline">Documents</span>
                      </Link>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              )}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white shadow-md shadow-violet-500/25 transition-transform hover:scale-[1.02]"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </motion.header>
      )}

      <main className="flex-1 transition-colors duration-200">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute roles={['manager']}>
                <DashboardManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/onboarding"
            element={
              <ProtectedRoute roles={['employee']}>
                <OnboardingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/documents"
            element={
              <ProtectedRoute roles={['employee']}>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          OnboardX — employee onboarding workflow
        </footer>
      )}
    </div>
  );
}

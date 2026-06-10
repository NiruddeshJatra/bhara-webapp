import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionBanner } from "@/components/common/ProfileCompletionBanner";
import { Toaster } from "react-hot-toast";

// Auth pages
import SignupPhone from "@/pages/auth/SignupPhone";
import SignupOtp from "@/pages/auth/SignupOtp";
import SignupDetails from "@/pages/auth/SignupDetails";
import Login from "@/pages/auth/Login";
import ForgotPasswordPhone from "@/pages/auth/ForgotPasswordPhone";
import ForgotPasswordOtp from "@/pages/auth/ForgotPasswordOtp";
import ForgotPasswordReset from "@/pages/auth/ForgotPasswordReset";

// Profile pages
import CompleteProfileStep1 from "@/pages/profile/CompleteProfileStep1";
import CompleteProfileStep2 from "@/pages/profile/CompleteProfileStep2";
import Profile from "@/pages/profile/Profile";

// Route guards
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/advertisements" replace /> : <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

function TransactionRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  const canTransact = user?.profile_completed && (user?.trust_level === 'verified' || user?.trust_level === 'partner');
  if (canTransact) return <>{children}</>;
  if (user?.profile_completed) return <Navigate to="/profile/complete/step2" replace />;
  return <Navigate to="/profile/complete/step1" replace />;
}

// Main App content
function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Profile Completion Banner */}
        {user && <ProfileCompletionBanner />}
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Routes */}
        <Routes>
          {/* Public routes */}
          <Route path="/auth/signup" element={
            <PublicRoute>
              <SignupPhone />
            </PublicRoute>
          } />
          <Route path="/auth/signup/otp" element={
            <PublicRoute>
              <SignupOtp />
            </PublicRoute>
          } />
          <Route path="/auth/signup/details" element={
            <PublicRoute>
              <SignupDetails />
            </PublicRoute>
          } />
          <Route path="/auth/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/auth/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPhone />
            </PublicRoute>
          } />
          <Route path="/auth/forgot-password/otp" element={
            <PublicRoute>
              <ForgotPasswordOtp />
            </PublicRoute>
          } />
          <Route path="/auth/forgot-password/reset" element={
            <PublicRoute>
              <ForgotPasswordReset />
            </PublicRoute>
          } />

          {/* Authenticated routes */}
          <Route path="/profile/complete/step1" element={
            <AuthRoute>
              <CompleteProfileStep1 />
            </AuthRoute>
          } />
          <Route path="/profile/complete/step2" element={
            <AuthRoute>
              <CompleteProfileStep2 />
            </AuthRoute>
          } />
          <Route path="/profile" element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          } />

          {/* Transaction routes */}
          <Route path="/advertisements" element={
            <TransactionRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Advertisements</h1>
                <p>This is where users can browse and create listings.</p>
              </div>
            </TransactionRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/advertisements" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

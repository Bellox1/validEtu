import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AcademicProvider } from './contexts/AcademicContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AcademicYears from './pages/academic/AcademicYears';
import AcademicYearDetail from './pages/academic/AcademicYearDetail';
import SemesterDetail from './pages/academic/SemesterDetail';
import UEDetail from './pages/academic/UEDetail';
import Simulations from './pages/Simulations';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage'; // 👈 Assure-toi que ce fichier existe

function App() {
  return (
    <Router>
      <AuthProvider>
        <AcademicProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* ✅ Page publique accessible par défaut */}
            <Route path="/" element={<Navigate to="/details" replace />} />
            <Route path="/details" element={<LandingPage />} />

            {/* Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Zone protégée */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="academic-years">
                <Route index element={<AcademicYears />} />
                <Route path=":yearId" element={<AcademicYearDetail />} />
                <Route path=":yearId/semester/:semesterId" element={<SemesterDetail />} />
                <Route path=":yearId/semester/:semesterId/ue/:ueId" element={<UEDetail />} />
              </Route>
              <Route path="simulations" element={<Simulations />} />
            </Route>
          </Routes>
        </AcademicProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

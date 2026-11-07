import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import UploadNote from './pages/UploadNote';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden bg-[#f5f2e9] text-[#23343a]">
      <Navbar />

      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={user ? <Explore /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/upload" element={user ? <UploadNote /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
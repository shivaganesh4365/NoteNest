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
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Dynamic Ambient Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

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
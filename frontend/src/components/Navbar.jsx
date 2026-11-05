import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, UploadCloud, LogOut, LayoutDashboard, Coins } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Note<span className="text-indigo-600">Nest</span>
            </span>
          </Link>

          {/* Navigation Links & User Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              Explore
            </Link>

            {user ? (
              <>
                {/* Live Credit Display */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs border border-amber-200 shadow-xs"
                  title="Your Available Balance (2 credits per download)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{user.credits ?? 0} Credits</span>
                </div>

                <Link
                  to="/upload"
                  className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload (+10)</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition hover:bg-slate-50"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
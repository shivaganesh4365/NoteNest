import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, UploadCloud, LogOut, LayoutDashboard, Coins } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo with Ambient Glow */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Note<span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Nest</span>
            </span>
          </Link>

          {/* Navigation & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive('/')
                  ? 'text-indigo-300 bg-indigo-500/15 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Explore
            </Link>

            {user ? (
              <>
                {/* Live Credit Chip */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-xl font-bold text-xs border border-amber-500/25 shadow-inner"
                  title="Your Available Balance (2 credits per download)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.credits ?? 0}</span>
                  <span className="hidden sm:inline text-amber-400/80 font-normal">Credits</span>
                </div>

                {/* Upload Button */}
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload (+10)</span>
                </Link>

                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'text-indigo-300 bg-indigo-500/15 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition hover:bg-slate-900/60"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/25 active:scale-95"
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
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

  const navClass = (path) => `border-b-2 px-1 py-2 text-sm transition ${
    location.pathname === path
      ? 'border-[#ad8950] font-semibold text-[#244b43]'
      : 'border-transparent text-[#687478] hover:border-[#c6b58f] hover:text-[#23343a]'
  }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-[#dedbd1] bg-[#fbfaf6]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="NoteNest home">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ad8950]/50 bg-[#244b43] text-[#eee2c6] shadow-sm transition group-hover:-rotate-3">
            <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </div>
          <span className="editorial-heading text-[1.7rem] leading-none text-[#23343a]">
            Note<span className="text-[#244b43]">Nest</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-7">
          <Link to="/" className={navClass('/')}>Library</Link>
          {user ? (
            <>
              <Link to="/upload" className={`${navClass('/upload')} hidden items-center gap-2 sm:flex`}>
                <UploadCloud className="h-4 w-4" />
                Contribute
              </Link>
              <Link to="/dashboard" aria-label="My shelf" className={`${navClass('/dashboard')} flex items-center gap-2`}>
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">My shelf</span>
              </Link>
              <div
                className="flex items-center gap-1.5 rounded-full border border-[#c9b986] bg-[#f2ead6] px-3 py-1.5 text-xs font-semibold text-[#68542e]"
                title="Your available credits"
              >
                <Coins className="h-3.5 w-3.5" />
                {user.credits ?? 0}
                <span className="hidden sm:inline">credits</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-[#687478] transition hover:bg-[#f1e7e2] hover:text-[#914c3f]"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-[17px] w-[17px]" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-5">
              <Link to="/login" className="text-sm font-medium text-[#687478] transition hover:text-[#23343a]">Sign in</Link>
              <Link to="/register" className="rounded-full bg-[#244b43] px-4 py-2 text-sm font-medium text-[#fffdf6] transition hover:bg-[#193a34]">
                Join NoteNest
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

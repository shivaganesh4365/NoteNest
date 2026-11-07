import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, Feather } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-7xl grid-cols-1 items-stretch px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
      <section className="relative hidden overflow-hidden rounded-l-[2rem] bg-[#193a34] p-12 text-[#f6f1e4] lg:flex lg:flex-col lg:justify-between">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[#c8b487]">
            <Feather className="h-4 w-4" /> A quieter place to learn
          </div>
          <h1 className="editorial-heading mt-16 max-w-xl text-6xl leading-[1.06]">
            Good notes make a world of difference.
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#d3d9cd]">
            Return to your study circle. Find thoughtful resources, share what you know, and keep your learning close at hand.
          </p>
        </div>
        <div className="relative flex items-center gap-3 border-t border-white/15 pt-5 text-sm text-[#d3d9cd]">
          <BookOpen className="h-5 w-5 text-[#c8b487]" />
          <span>Independent learning, shared generously.</span>
        </div>
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-[#d1bd8f]/20" />
        <div className="absolute -bottom-16 -right-8 h-56 w-56 rounded-full border border-[#d1bd8f]/20" />
      </section>

      <section className="paper-panel flex items-center justify-center rounded-[2rem] p-6 sm:p-10 lg:rounded-l-none lg:rounded-r-[2rem] lg:p-14">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#244b43] text-[#eee2c6]">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.19em] text-[#ad8950]">NoteNest Library</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.19em] text-[#ad8950]">Welcome back</p>
          <h2 className="editorial-heading mt-2 text-4xl text-[#23343a] sm:text-5xl">Sign in to your shelf</h2>
          <p className="mt-3 text-sm leading-6 text-[#687478]">Your next good idea may be only a few pages away.</p>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-[#c88778]/40 bg-[#f7e9e4] px-4 py-3 text-sm text-[#884b40]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#35464a]">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="classic-input py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[#35464a]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="classic-input py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="classic-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Enter the library <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#687478]">
            New to NoteNest?{' '}
            <Link to="/register" className="font-semibold text-[#244b43] underline decoration-[#ad8950]/60 underline-offset-4 hover:text-[#193a34]">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

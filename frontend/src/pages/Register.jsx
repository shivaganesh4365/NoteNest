import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, User, Mail, Lock, School, ArrowRight, Loader2, Gift, Quote } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', college: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', formData);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#ded5c2] bg-[#eee8d9] p-8 sm:p-10 lg:min-h-[690px] lg:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#ad8950]/20" />
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#ad8950]/20" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#244b43] text-[#eee2c6]">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.19em] text-[#9a7946]">The NoteNest community</p>
            <h1 className="editorial-heading mt-3 max-w-lg text-4xl leading-tight text-[#23343a] sm:text-5xl">
              Make room for a brighter kind of studying.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#687478]">
              A shared library, built by students. Start with a few free credits and discover the notes that make difficult subjects click.
            </p>
          </div>
          <blockquote className="relative mt-12 border-l-2 border-[#ad8950] pl-5">
            <Quote className="mb-3 h-5 w-5 text-[#ad8950]" />
            <p className="editorial-heading text-2xl leading-snug text-[#35464a]">“Knowledge grows when it is passed along.”</p>
            <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#81867d]">A NoteNest principle</footer>
          </blockquote>
        </div>
      </section>

      <section className="paper-panel rounded-[2rem] p-6 sm:p-10 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.19em] text-[#ad8950]">Begin your membership</p>
        <h2 className="editorial-heading mt-2 text-4xl text-[#23343a] sm:text-5xl">Create your account</h2>
        <p className="mt-3 text-sm text-[#687478]">Join your peers in a more thoughtful study space.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#c7d2c3] bg-[#edf2e9] px-3.5 py-2 text-xs font-semibold text-[#42614d]">
          <Gift className="h-4 w-4" /> 6 welcome credits included
        </div>

        {error && (
          <div role="alert" className="mt-5 rounded-xl border border-[#c88778]/40 bg-[#f7e9e4] px-4 py-3 text-sm text-[#884b40]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-[#35464a]">Full name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
              <input id="register-name" type="text" name="name" required autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Alex Morgan" className="classic-input py-3 pl-11 pr-4 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="register-college" className="mb-2 block text-sm font-semibold text-[#35464a]">College / institute</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
              <input id="register-college" type="text" name="college" required autoComplete="organization" value={formData.college} onChange={handleChange} placeholder="Your university" className="classic-input py-3 pl-11 pr-4 text-sm" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-[#35464a]">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
              <input id="register-email" type="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} placeholder="alex@university.edu" className="classic-input py-3 pl-11 pr-4 text-sm" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-[#35464a]">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
              <input id="register-password" type="password" name="password" required autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="Choose a secure password" className="classic-input py-3 pl-11 pr-4 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="classic-button mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Join the library <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#687478]">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-[#244b43] underline decoration-[#ad8950]/60 underline-offset-4 hover:text-[#193a34]">Sign in</Link>
        </p>
      </section>
    </div>
  );
}

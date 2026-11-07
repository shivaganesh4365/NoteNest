import { useState, useContext } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, Tag, FileText, Sparkles } from 'lucide-react';

export default function UploadNote() {
  const { updateUserCredits } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: '1',
    department: 'Computer Science',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF document.');
      return;
    }

    setError('');
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('semester', formData.semester);
    data.append('department', formData.department);
    data.append('tags', formData.tags);
    data.append('file', file);

    try {
      const res = await API.post('/notes', data);

      // Update navbar credits balance with the +10 earned
      if (res.data.remainingCredits !== undefined) {
        updateUserCredits(res.data.remainingCredits);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[110px]" />

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Share knowledge, earn credits
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Upload study material
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Add your notes to the community library and help other students study smarter.
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 p-5 shadow-2xl shadow-indigo-950/30 sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Resource details</h2>
                <p className="mt-0.5 text-xs text-slate-400">PDF files up to 25 MB</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              +10 credits
            </span>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-3.5 text-sm font-medium text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">Resource title</label>
              <input
                type="text"
                required
                placeholder="e.g. Operating Systems - Unit 1 to 4 Notes"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester} className="bg-slate-900">Semester {semester}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Electronics'].map((d) => (
                  <option key={d} value={d} className="bg-slate-900">{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">
                Tags <span className="font-normal text-slate-500">(comma-separated)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Midterm1, Formulas, Unit3, Handwritten"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pdf-file" className="mb-1.5 ml-1 block text-xs font-semibold text-slate-300">PDF document</label>
              <div className="group relative cursor-pointer rounded-2xl border border-dashed border-indigo-300/25 bg-slate-950/35 p-7 text-center transition hover:border-indigo-300/50 hover:bg-indigo-500/5 sm:p-9">
                <input
                  id="pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3 text-left">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                      <p className="mt-1 text-xs text-emerald-300">PDF ready to upload</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="mx-auto h-8 w-8 text-indigo-300 transition group-hover:-translate-y-0.5" />
                    <p className="text-sm font-semibold text-slate-200">Choose a PDF or drag it here</p>
                    <p className="text-xs text-slate-500">Maximum file size: 25 MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-btn mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              {loading ? 'Uploading resource…' : 'Upload resource and earn 10 credits'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
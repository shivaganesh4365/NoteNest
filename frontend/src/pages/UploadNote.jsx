import { useState, useContext } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, Tag, BookOpen, Gift } from 'lucide-react';

const fieldClass = 'classic-input px-4 py-3 text-sm';
const labelClass = 'mb-2 block text-sm font-semibold text-[#35464a]';

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
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-12">
      <aside className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#244b43] p-7 text-[#f6f1e4] sm:p-10 lg:min-h-[690px]">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d6c596]/30 bg-white/5 text-[#e2d1a9]">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b487]">Give your notes a new life</p>
          <h1 className="editorial-heading mt-3 text-4xl leading-tight sm:text-5xl">
            Your next upload could help someone understand.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#d3d9cd]">
            Share a clear, useful resource with your community. Your contribution earns credits and makes the library stronger.
          </p>
        </div>
        <div className="relative mt-8 space-y-4 border-t border-white/15 pt-6">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d6c596]/40 text-xs font-semibold text-[#e2d1a9]">01</span>
            <p className="pt-1 text-sm text-[#e5e5d8]">Add a descriptive title and subject.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d6c596]/40 text-xs font-semibold text-[#e2d1a9]">02</span>
            <p className="pt-1 text-sm text-[#e5e5d8]">Attach a PDF up to 25 MB.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d6c596]/40 text-xs font-semibold text-[#e2d1a9]">03</span>
            <p className="pt-1 text-sm text-[#e5e5d8]">Earn 10 credits when it is shared.</p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-[#d6c596]/15" />
      </aside>

      <section className="paper-panel rounded-[2rem] p-5 sm:p-9 lg:p-11">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e1d7] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ad8950]">Contribute to the library</p>
            <h2 className="editorial-heading mt-2 text-3xl text-[#23343a] sm:text-4xl">Resource details</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c7d2c3] bg-[#edf2e9] px-3 py-1.5 text-xs font-semibold text-[#42614d]">
            <Gift className="h-3.5 w-3.5" /> +10 credits
          </span>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-[#c88778]/40 bg-[#f7e9e4] px-4 py-3 text-sm text-[#884b40]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="resource-title" className={labelClass}>Resource title</label>
            <input id="resource-title" type="text" required placeholder="e.g. Operating Systems — Unit 1 to 4" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={fieldClass} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="resource-subject" className={labelClass}>Subject</label>
              <input id="resource-subject" type="text" required placeholder="e.g. Data Structures" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="resource-semester" className={labelClass}>Semester</label>
              <select id="resource-semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className={fieldClass}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="resource-department" className={labelClass}>Department</label>
              <select id="resource-department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={fieldClass}>
                {['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Electronics'].map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="resource-tags" className={labelClass}>Tags <span className="font-normal text-[#89918b]">(optional)</span></label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
                <input id="resource-tags" type="text" placeholder="Formulas, Unit 3, Midterm" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className={`${fieldClass} pl-11`} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="pdf-file" className={labelClass}>PDF document</label>
            <div className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#b8bcae] bg-[#f7f6f0] px-5 py-7 text-center transition hover:border-[#53766c] hover:bg-[#f1f3eb]">
              <input id="pdf-file" type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
              {file ? (
                <div className="flex items-center gap-3 text-left">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-[#4c8066]" />
                  <div className="min-w-0">
                    <p className="max-w-xs truncate text-sm font-semibold text-[#35464a]">{file.name}</p>
                    <p className="mt-1 text-xs text-[#68816e]">Ready to add to your library</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e7ece3] text-[#42614d] transition group-hover:-translate-y-0.5">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#35464a]">Choose a PDF to upload</p>
                  <p className="mt-1 text-xs text-[#89918b]">or drop it here · maximum 25 MB</p>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="classic-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Uploading your resource…' : <><UploadCloud className="h-4 w-4" /> Publish resource</>}
          </button>
        </form>
      </section>
    </div>
  );
}

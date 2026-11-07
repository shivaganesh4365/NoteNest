import { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, School, Calendar, Filter,
  Eye, Heart, Bookmark, Sparkles, BookOpen, ArrowUpRight, Flag
} from 'lucide-react';
import PdfPreviewModal from '../components/PdfPreviewModal';
import OutOfCreditsModal from '../components/OutOfCreditsModal';
import ReportResourceModal from '../components/ReportResourceModal';

export default function Explore() {
  const { user, updateUserCredits } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('All');
  const [sort, setSort] = useState('latest');
  const [activeTag, setActiveTag] = useState('');
  const [savedNoteIds, setSavedNoteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOutOfCreditsOpen, setIsOutOfCreditsOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const departments = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Electronics'];

  const fetchNotes = useCallback(async () => {
    try {
      const res = await API.get('/notes', {
        params: { search, semester, department, sort, tag: activeTag || undefined }
      });
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, semester, department, sort, activeTag]);

  const fetchSavedNotes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get('/notes/saved');
      setSavedNoteIds(res.data.map((note) => note._id));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchNotes, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchNotes]);

  useEffect(() => {
    fetchSavedNotes();
  }, [fetchSavedNotes]);

  const handleOpenPreview = (note) => {
    setSelectedNote(note);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedNote(null);
  };

  const handleToggleUpvote = async (noteId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await API.patch(`/notes/${noteId}/upvote`);
      setNotes((prev) => prev.map((note) => {
        if (note._id !== noteId) return note;
        const currentUpvotes = note.upvotes || [];
        const hasVoted = currentUpvotes.includes(user._id);
        const updatedUpvotes = hasVoted
          ? currentUpvotes.filter((id) => id !== user._id)
          : [...currentUpvotes, user._id];
        return { ...note, upvotes: updatedUpvotes };
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (noteId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await API.patch(`/notes/${noteId}/bookmark`);
      if (res.data.isBookmarked) {
        setSavedNoteIds((prev) => [...new Set([...prev, noteId])]);
      } else {
        setSavedNoteIds((prev) => prev.filter((id) => id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInAppDownload = async (note) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await API.post(`/notes/${note._id}/download`);
      const { fileName, credits } = res.data;
      if (credits !== undefined) updateUserCredits(credits);

      const { data: blob } = await API.get(`/notes/${note._id}/file`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setNotes((prev) => prev.map((item) =>
        item._id === note._id ? { ...item, downloadCount: (item.downloadCount || 0) + 1 } : item
      ));
    } catch (err) {
      if (err.response?.status === 403) {
        setIsOutOfCreditsOpen(true);
      } else {
        alert(err.response?.data?.message || err.message || 'Download error. Please check server connection.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#f5f2e9] pb-20">
      <header className="relative overflow-hidden border-b border-[#dedbd1] bg-[#eee9dc]">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_280px] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.19em] text-[#927444]">
              <Sparkles className="h-4 w-4" /> The student knowledge exchange
            </div>
            <h1 className="editorial-heading max-w-3xl text-5xl leading-[1.04] text-[#23343a] sm:text-6xl lg:text-7xl">
              Good notes are <span className="italic text-[#42685c]">meant to be shared.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#687478] sm:text-base">
              Browse a growing collection of course notes, study guides, and useful resources — shared by students, for students.
            </p>
          </div>
          <div className="relative hidden min-h-44 items-end border-l border-[#c9c0ab] pl-7 lg:flex">
            <div className="absolute left-7 top-1 h-20 w-20 rounded-full border border-[#ad8950]/35" />
            <div className="absolute left-12 top-6 h-20 w-20 rounded-full border border-[#ad8950]/35" />
            <div className="relative pb-1">
              <BookOpen className="mb-3 h-5 w-5 text-[#ad8950]" strokeWidth={1.5} />
              <p className="editorial-heading text-2xl text-[#35464a]">Learn together.</p>
              <p className="mt-1 text-xs text-[#818780]">A library made by your peers.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative z-10 -mt-5 rounded-2xl border border-[#dedbd1] bg-[#fffefa] p-4 shadow-[0_12px_30px_rgba(58,54,43,0.07)] sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_190px_210px]">
            <label className="relative block">
              <span className="sr-only">Search study materials</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89918b]" />
              <input type="text" placeholder="Search a subject, topic, or keyword…" value={search} onChange={(e) => { setLoading(true); setSearch(e.target.value); }} className="classic-input py-3 pl-11 pr-4 text-sm" />
            </label>
            <label>
              <span className="sr-only">Filter by semester</span>
              <select value={semester} onChange={(e) => { setLoading(true); setSemester(e.target.value); }} className="classic-input cursor-pointer px-3.5 py-3 text-sm">
                <option value="">All semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <option key={item} value={item}>Semester {item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort resources</span>
              <select value={sort} onChange={(e) => { setLoading(true); setSort(e.target.value); }} className="classic-input cursor-pointer px-3.5 py-3 text-sm">
                <option value="latest">Recently added</option>
                <option value="upvotes">Most appreciated</option>
                <option value="popular">Most downloaded</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eeeae1] pt-4">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#818780]">
              <Filter className="h-3.5 w-3.5" /> Department
            </span>
            {departments.map((dept) => (
              <button key={dept} onClick={() => { setLoading(true); setDepartment(dept); }} className={`rounded-full border px-3 py-1.5 text-xs transition ${
                department === dept
                  ? 'border-[#244b43] bg-[#244b43] text-white'
                  : 'border-[#e1ded5] bg-[#fbfaf6] text-[#687478] hover:border-[#9cae9f] hover:text-[#244b43]'
              }`}>
                {dept}
              </button>
            ))}
            {activeTag && (
              <button onClick={() => { setLoading(true); setActiveTag(''); }} className="rounded-full border border-[#c9b986] bg-[#f2ead6] px-3 py-1.5 text-xs font-semibold text-[#68542e]">
                #{activeTag} ×
              </button>
            )}
          </div>
        </section>

        <section className="pt-10">
          <div className="mb-5 flex items-end justify-between border-b border-[#d9d5ca] pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ad8950]">From the community</p>
              <h2 className="editorial-heading mt-1 text-3xl text-[#23343a]">The collection</h2>
            </div>
            <p className="text-xs text-[#818780]">{loading ? 'Finding resources…' : `${notes.length} ${notes.length === 1 ? 'resource' : 'resources'}`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-[#e4e0d6] bg-[#eeece4]" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="paper-panel mx-auto max-w-xl rounded-2xl px-6 py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-[#ad8950]" strokeWidth={1.3} />
              <h3 className="editorial-heading mt-4 text-2xl text-[#23343a]">A page yet to be filled.</h3>
              <p className="mt-2 text-sm leading-6 text-[#687478]">No resources match those filters. Try another subject, or be the first to share.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {notes.map((note, index) => {
                const hasUpvoted = user && note.upvotes?.includes(user._id);
                const isBookmarked = savedNoteIds.includes(note._id);
                const accents = ['border-t-[#789080]', 'border-t-[#ad8950]', 'border-t-[#8a7772]'];
                return (
                  <article key={note._id} className={`group flex min-h-[310px] flex-col justify-between rounded-2xl border border-[#e1ded5] border-t-[3px] ${accents[index % accents.length]} bg-[#fffefa] p-5 shadow-[0_6px_20px_rgba(58,54,43,0.035)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(58,54,43,0.09)] sm:p-6`}>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#f0eee6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#687478]">
                          <span className="text-[#ad8950]">№</span> Semester {note.semester}
                        </div>
                        <button onClick={() => handleToggleBookmark(note._id)} className={`rounded-full p-2 transition ${isBookmarked ? 'bg-[#f1ead9] text-[#9a7946]' : 'text-[#a1a39c] hover:bg-[#f1ead9] hover:text-[#9a7946]'}`} title={isBookmarked ? 'Remove bookmark' : 'Bookmark note'} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark note'}>
                          <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <button onClick={() => handleOpenPreview(note)} className="mt-5 block text-left">
                        <h3 className="editorial-heading line-clamp-2 text-[1.65rem] leading-tight text-[#23343a] transition group-hover:text-[#42685c]">{note.title}</h3>
                        <p className="mt-2 text-sm font-medium text-[#687478]">{note.subject}</p>
                      </button>

                      {note.tags?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {note.tags.map((tag, tagIndex) => (
                            <button key={`${tag}-${tagIndex}`} onClick={() => setActiveTag(tag)} className="rounded-full border border-[#e6e2d8] px-2.5 py-1 text-[10px] text-[#818780] transition hover:border-[#ad8950]/60 hover:text-[#795f37]">
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 space-y-2 border-t border-[#eeeae1] pt-4 text-xs text-[#818780]">
                        <div className="flex items-center gap-2"><School className="h-3.5 w-3.5 text-[#ad8950]" /><span className="truncate">{note.uploadedBy?.college || 'Engineering Institute'}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-[#ad8950]" /><span>Shared by {note.uploadedBy?.name || 'A fellow student'}</span></div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#eeeae1] pt-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleUpvote(note._id)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${hasUpvoted ? 'border-[#d7aaa0] bg-[#f7e9e4] text-[#914c3f]' : 'border-[#e1ded5] text-[#687478] hover:border-[#d7aaa0] hover:text-[#914c3f]'}`}>
                          <Heart className="h-3.5 w-3.5" fill={hasUpvoted ? 'currentColor' : 'none'} /> {note.upvotes?.length || 0}
                        </button>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#818780]"><Download className="h-3.5 w-3.5" /> {note.downloadCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenPreview(note)} className="rounded-full p-2 text-[#818780] transition hover:bg-[#f0eee6] hover:text-[#244b43]" title="Preview PDF" aria-label="Preview PDF"><Eye className="h-4 w-4" /></button>
                        {note.uploadedBy?._id !== user?._id && (
                          <button onClick={() => user ? setReportTarget(note) : navigate('/login')} className="rounded-full p-2 text-[#a1a39c] transition hover:bg-[#f7e9e4] hover:text-[#914c3f]" title="Report resource" aria-label={`Report ${note.title}`}><Flag className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => handleInAppDownload(note)} className="inline-flex items-center gap-1.5 rounded-full bg-[#244b43] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#193a34]">
                          Get notes <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <PdfPreviewModal note={selectedNote} isOpen={isPreviewOpen} onClose={handleClosePreview} onDownload={handleInAppDownload} />
      <OutOfCreditsModal isOpen={isOutOfCreditsOpen} onClose={() => setIsOutOfCreditsOpen(false)} />
      <ReportResourceModal
        note={reportTarget}
        onClose={() => setReportTarget(null)}
        onReported={() => window.alert('Thank you. The moderation team will review your report.')}
      />
    </div>
  );
}

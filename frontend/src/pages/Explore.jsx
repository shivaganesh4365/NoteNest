import { useState, useEffect, useContext } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, FileText, School, Calendar, Filter,
  Eye, Heart, Bookmark, Sparkles, BookOpen, ArrowUpRight
} from 'lucide-react';
import PdfPreviewModal from '../components/PdfPreviewModal';
import OutOfCreditsModal from '../components/OutOfCreditsModal';

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
  const [loading, setLoading] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOutOfCreditsOpen, setIsOutOfCreditsOpen] = useState(false);

  const departments = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Electronics'];

  const fetchNotes = async () => {
    setLoading(true);
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
  };

  const fetchSavedNotes = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notes/saved');
      setSavedNoteIds(res.data.map((n) => n._id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, semester, department, sort, activeTag]);

  useEffect(() => {
    fetchSavedNotes();
  }, [user]);

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
      setNotes((prev) =>
        prev.map((n) => {
          if (n._id !== noteId) return n;
          const currentUpvotes = n.upvotes || [];
          const hasVoted = currentUpvotes.includes(user._id);
          const updatedUpvotes = hasVoted
            ? currentUpvotes.filter((id) => id !== user._id)
            : [...currentUpvotes, user._id];
          return { ...n, upvotes: updatedUpvotes };
        })
      );
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
        setSavedNoteIds((prev) => [...prev, noteId]);
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
      const { fileUrl, fileName, credits } = res.data;

      if (credits !== undefined) {
        updateUserCredits(credits);
      }

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
      const response = await fetch(`${backendUrl}${cleanFileUrl}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? { ...n, downloadCount: (n.downloadCount || 0) + 1 } : n))
      );
    } catch (err) {
      if (err.response?.status === 403) {
        setIsOutOfCreditsOpen(true);
      } else {
        alert(err.response?.data?.message || err.message || 'Download error. Please check server connection.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Decorative Background Lighting Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[400px] -left-40 w-[400px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Community Academic Hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Elevate your study with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              verified peer notes
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Discover semester guides, verified lab records, and high-scoring notes. Earn credits while helping your peers excel.
          </p>
        </div>

        {/* Filter and Search Bar Dock */}
        <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl mb-12 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by topic, subject, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 focus:bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent text-sm transition"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 focus:bg-slate-950 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 text-sm transition cursor-pointer"
              >
                <option value="" className="bg-slate-900">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s} className="bg-slate-900">Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 focus:bg-slate-950 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 text-sm font-medium transition cursor-pointer"
              >
                <option value="latest" className="bg-slate-900">Sort by: Latest</option>
                <option value="upvotes" className="bg-slate-900">Sort by: Top Upvoted</option>
                <option value="popular" className="bg-slate-900">Sort by: Most Downloaded</option>
              </select>
            </div>
          </div>

          {/* Department Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Dept:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
                  department === dept
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {dept}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag('')}
                className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-xl font-semibold border border-indigo-500/30 hover:bg-indigo-500/30 transition"
              >
                #{activeTag} ✕
              </button>
            )}
          </div>
        </div>

        {/* Notes Feed Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/40 border border-slate-800/80 animate-pulse p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-20 h-5 bg-slate-800 rounded-lg" />
                  <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
                  <div className="w-1/2 h-4 bg-slate-800/60 rounded-lg" />
                </div>
                <div className="h-10 bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-sm max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No notes found</h3>
            <p className="text-sm text-slate-500 mt-1">Try switching filters or be the first to share notes for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              const hasUpvoted = user && note.upvotes?.includes(user._id);
              const isBookmarked = savedNoteIds.includes(note._id);

              return (
                <div
                  key={note._id}
                  className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm hover:-translate-y-1"
                >
                  <div>
                    {/* Header: Semester Tag & Department */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded-lg">
                        Sem {note.semester}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-800/50">
                          {note.department}
                        </span>
                        <button
                          onClick={() => handleToggleBookmark(note._id)}
                          className={`p-1.5 rounded-xl transition ${
                            isBookmarked
                              ? 'text-amber-400 bg-amber-400/15'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark note'}
                        >
                          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3
                      onClick={() => handleOpenPreview(note)}
                      className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1 flex items-center gap-1.5"
                    >
                      <span>{note.title}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </h3>

                    <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">
                      {note.subject}
                    </p>

                    {/* Tags */}
                    {note.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {note.tags.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTag(t)}
                            className="text-[11px] bg-slate-800/70 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 px-2 py-0.5 rounded-md font-medium transition"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-800/60 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{note.uploadedBy?.college || 'Engineering Institute'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>By {note.uploadedBy?.name || 'Anonymous Peer'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleUpvote(note._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                          hasUpvoted
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" fill={hasUpvoted ? 'currentColor' : 'none'} />
                        <span>{note.upvotes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleOpenPreview(note)}
                        className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 rounded-xl transition"
                        title="Preview PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleInAppDownload(note)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/20 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PdfPreviewModal
        note={selectedNote}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={handleInAppDownload}
      />

      <OutOfCreditsModal
        isOpen={isOutOfCreditsOpen}
        onClose={() => setIsOutOfCreditsOpen(false)}
      />
    </div>
  );
}
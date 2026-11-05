import { useState, useEffect, useContext } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Download, FileText, School, Calendar, Filter, Eye, Heart, Bookmark } from 'lucide-react';
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

  // Modals State
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
      // 1. Check and deduct credits from the backend
      const res = await API.post(`/notes/${note._id}/download`);
      const { fileUrl, fileName, credits } = res.data;

      // 2. Synchronize new credit balance in AuthContext & Navbar
      if (credits !== undefined) {
        updateUserCredits(credits);
      }

      // 3. Trigger in-app blob download to save file locally
      const response = await fetch(`http://localhost:5000${fileUrl}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // 4. Update download count on cards
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? { ...n, downloadCount: (n.downloadCount || 0) + 1 } : n))
      );
    } catch (err) {
      if (err.response?.status === 403) {
        setIsOutOfCreditsOpen(true);
      } else {
        alert(err.response?.data?.message || 'Download error. Please check server connection.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find & Share Academic Material
        </h1>
        <p className="mt-2 text-slate-600 text-sm">
          Preview lecture notes, save key resources, and earn credits by contributing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, subject, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm font-medium text-slate-700"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="upvotes">Sort by: Top Upvoted</option>
              <option value="popular">Sort by: Most Downloaded</option>
            </select>
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Dept:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartment(dept)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                department === dept
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
          {activeTag && (
            <button
              onClick={() => setActiveTag('')}
              className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-200"
            >
              #{activeTag} ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of Notes */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading resources...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No notes found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or upload the first note for this subject!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const hasUpvoted = user && note.upvotes?.includes(user._id);
            const isBookmarked = savedNoteIds.includes(note._id);

            return (
              <div
                key={note._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      Semester {note.semester}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBookmark(note._id)}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark note'}
                      >
                        <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-xs text-slate-400 font-medium">{note.department}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => handleOpenPreview(note)}
                    className="font-bold text-lg text-slate-900 line-clamp-1 cursor-pointer hover:text-indigo-600 transition"
                  >
                    {note.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 mt-1">{note.subject}</p>

                  {/* Tags */}
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {note.tags.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTag(t)}
                          className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-0.5 rounded font-medium transition"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span>{note.uploadedBy?.college || 'University Student'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Uploaded by {note.uploadedBy?.name || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleUpvote(note._id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                        hasUpvoted
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Upvote note"
                    >
                      <Heart className="w-3.5 h-3.5" fill={hasUpvoted ? 'currentColor' : 'none'} />
                      <span>{note.upvotes?.length || 0}</span>
                    </button>

                    <button
                      onClick={() => handleOpenPreview(note)}
                      className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-slate-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleInAppDownload(note)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (2 🪙)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF In-App Preview Modal */}
      <PdfPreviewModal
        note={selectedNote}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={handleInAppDownload}
      />

      {/* Out of Credits Prompt Modal */}
      <OutOfCreditsModal
        isOpen={isOutOfCreditsOpen}
        onClose={() => setIsOutOfCreditsOpen(false)}
      />
    </div>
  );
}
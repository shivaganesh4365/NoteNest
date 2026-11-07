import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Trash2, FileText, Download, Bookmark, Layers, UploadCloud, ArrowUpRight, LibraryBig, Heart } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('uploads');
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [notesRes, savedRes] = await Promise.all([
        API.get('/notes/my-notes'),
        API.get('/notes/saved')
      ]);
      setMyNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      setSavedNotes(Array.isArray(savedRes.data) ? savedRes.data : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setMyNotes([]);
      setSavedNotes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/notes/${id}`);
      setMyNotes((prev) => prev.filter((note) => note._id !== id));
      setSavedNotes((prev) => prev.filter((note) => note._id !== id));
    } catch {
      alert('Could not delete note.');
    }
  };

  const handleRemoveBookmark = async (id) => {
    try {
      const res = await API.patch(`/notes/${id}/bookmark`);
      if (res.data?.isBookmarked === false) {
        setSavedNotes((prev) => prev.filter((note) => note._id !== id));
      }
    } catch {
      alert('Could not remove bookmark.');
    }
  };

  const handleInAppDownload = async (note) => {
    if (!note?._id) {
      alert('This note is missing a valid file reference.');
      return;
    }

    try {
      const res = await API.post(`/notes/${note._id}/download`);
      const { fileName } = res.data;
      const { data: blob } = await API.get(`/notes/${note._id}/file`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setMyNotes((prev) => prev.map((item) =>
        item._id === note._id ? { ...item, downloadCount: (item.downloadCount || 0) + 1 } : item
      ));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Download failed.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalDownloads = myNotes.reduce((total, note) => total + (note.downloadCount || 0), 0);
  const totalUpvotes = myNotes.reduce((total, note) => total + (note.upvotes?.length || 0), 0);
  const showingUploads = activeTab === 'uploads';
  const visibleNotes = showingUploads ? myNotes : savedNotes;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#193a34] px-6 py-8 text-[#f6f1e4] sm:px-10 sm:py-10">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b487]">Your NoteNest</p>
            <h1 className="editorial-heading mt-2 text-4xl sm:text-5xl">A shelf of your own.</h1>
            <p className="mt-3 text-sm text-[#d3d9cd]">{user?.email} <span className="mx-1.5 text-[#b8c2b1]">·</span> {user?.college || 'Independent learner'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-24 border-l border-[#d6c596]/40 pl-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#c8b487]">Shared</p>
              <p className="editorial-heading mt-1 text-3xl">{myNotes.length}</p>
            </div>
            <div className="min-w-24 border-l border-[#d6c596]/40 pl-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#c8b487]">Downloads</p>
              <p className="editorial-heading mt-1 text-3xl">{totalDownloads}</p>
            </div>
            <div className="min-w-24 border-l border-[#d6c596]/40 pl-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#c8b487]">Appreciation</p>
              <p className="editorial-heading mt-1 text-3xl">{totalUpvotes}</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-28 -right-10 h-64 w-64 rounded-full border border-[#d6c596]/15" />
      </header>

      <section className="mt-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#d9d5ca] pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ad8950]">Collection</p>
            <h2 className="editorial-heading mt-1 text-3xl text-[#23343a]">Your library</h2>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex rounded-xl border border-[#dedbd1] bg-[#eeece4] p-1">
              <button onClick={() => setActiveTab('uploads')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${showingUploads ? 'bg-[#fffefa] text-[#244b43] shadow-sm' : 'text-[#687478] hover:text-[#23343a]'}`}>
                <Layers className="h-4 w-4" /> My uploads <span className="text-[#9b9e97]">{myNotes.length}</span>
              </button>
              <button onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${!showingUploads ? 'bg-[#fffefa] text-[#244b43] shadow-sm' : 'text-[#687478] hover:text-[#23343a]'}`}>
                <Bookmark className="h-4 w-4" /> Saved <span className="text-[#9b9e97]">{savedNotes.length}</span>
              </button>
            </div>
            <Link to="/upload" className="hidden items-center gap-2 rounded-xl bg-[#244b43] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#193a34] sm:flex">
              <UploadCloud className="h-4 w-4" /> Contribute
            </Link>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="paper-panel rounded-2xl p-12 text-center text-sm text-[#687478]">Gathering your collection…</div>
          ) : visibleNotes.length === 0 ? (
            <div className="paper-panel flex flex-col items-center rounded-2xl px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9ede4] text-[#42614d]">
                {showingUploads ? <LibraryBig className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />}
              </div>
              <h3 className="editorial-heading mt-5 text-2xl text-[#23343a]">{showingUploads ? 'Your shelf is waiting.' : 'Nothing saved just yet.'}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#687478]">
                {showingUploads ? 'Share your first study resource and help another student find their way.' : 'Save useful resources from the library and they will be collected here.'}
              </p>
              <Link to={showingUploads ? '/upload' : '/'} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#244b43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#193a34]">
                {showingUploads ? <><UploadCloud className="h-4 w-4" /> Share a resource</> : <>Explore the library <ArrowUpRight className="h-4 w-4" /></>}
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#dedbd1] bg-[#fffefa]">
              <div className="hidden grid-cols-[minmax(0,1fr)_170px_130px] gap-4 border-b border-[#e7e3da] bg-[#f0eee6] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#818780] sm:grid">
                <span>Resource</span><span>Details</span><span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-[#ebe8df]">
                {visibleNotes.map((note) => (
                  <article key={note._id} className="grid grid-cols-1 items-center gap-4 px-4 py-4 transition hover:bg-[#faf8f1] sm:grid-cols-[minmax(0,1fr)_170px_130px] sm:px-6">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${showingUploads ? 'bg-[#e9ede4] text-[#42614d]' : 'bg-[#f1ead9] text-[#9a7946]'}`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#23343a]">{note.title}</h3>
                        <p className="mt-1 truncate text-xs text-[#818780]">{note.subject} · Semester {note.semester}</p>
                          {showingUploads && note.reviewStatus && note.reviewStatus !== 'approved' && (
                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              note.reviewStatus === 'pending'
                                ? 'bg-[#f1ead9] text-[#795f37]'
                                : 'bg-[#f7e9e4] text-[#914c3f]'
                            }`}>
                              {note.reviewStatus === 'pending' ? 'Awaiting review' : 'Not approved'}
                            </span>
                          )}
                          {showingUploads && note.moderationNote && note.reviewStatus === 'rejected' && (
                            <p className="mt-1 text-xs text-[#914c3f]">{note.moderationNote}</p>
                          )}
                      </div>
                    </div>
                    <div className="text-xs text-[#687478]">
                      {showingUploads ? (
                        <span className="inline-flex items-center gap-2"><Download className="h-3.5 w-3.5 text-[#ad8950]" /> {note.downloadCount || 0} downloads <Heart className="ml-1 h-3.5 w-3.5 text-[#ad8950]" /> {note.upvotes?.length || 0}</span>
                      ) : (
                        <span>By {note.uploadedBy?.name || 'A fellow student'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      {(!showingUploads || !note.reviewStatus || note.reviewStatus === 'approved') && (
                        <button onClick={() => handleInAppDownload(note)} className="rounded-lg p-2 text-[#687478] transition hover:bg-[#e9ede4] hover:text-[#244b43]" title="Download resource" aria-label={`Download ${note.title}`}>
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {showingUploads ? (
                        <button onClick={() => handleDelete(note._id)} className="rounded-lg p-2 text-[#92958d] transition hover:bg-[#f7e9e4] hover:text-[#914c3f]" title="Delete resource" aria-label={`Delete ${note.title}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleRemoveBookmark(note._id)} className="rounded-lg p-2 text-[#92958d] transition hover:bg-[#f1ead9] hover:text-[#9a7946]" title="Remove bookmark" aria-label={`Remove ${note.title} from saved`}>
                          <Bookmark className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import API from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Trash2, FileText, Download, Bookmark, Layers } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'saved'
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, savedRes] = await Promise.all([
        API.get('/notes/my-notes'),
        API.get('/notes/saved')
      ]);
      setMyNotes(notesRes.data);
      setSavedNotes(savedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/notes/${id}`);
      setMyNotes(myNotes.filter((n) => n._id !== id));
    } catch {
      alert('Could not delete note.');
    }
  };

  const handleRemoveBookmark = async (id) => {
    try {
      await API.patch(`/notes/${id}/bookmark`);
      setSavedNotes(savedNotes.filter((n) => n._id !== id));
    } catch {
      alert('Could not remove bookmark.');
    }
  };

  const handleInAppDownload = async (note) => {
    try {
      const response = await fetch(`http://localhost:5000${note.fileUrl}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = note.fileName || `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      await API.patch(`/notes/${note._id}/download`);
    } catch (err) {
      alert('Download failed.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDownloads = myNotes.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const totalUpvotes = myNotes.reduce((acc, curr) => acc + (curr.upvotes?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* User Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-extrabold text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email} • {user?.college}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Uploaded</p>
            <p className="text-xl font-extrabold text-slate-800">{myNotes.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Downloads</p>
            <p className="text-xl font-extrabold text-indigo-600">{totalDownloads}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Upvotes</p>
            <p className="text-xl font-extrabold text-rose-500">{totalUpvotes}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'uploads'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Uploads ({myNotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'saved'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Material ({savedNotes.length})</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading resources...</div>
        ) : activeTab === 'uploads' ? (
          myNotes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No notes uploaded yet</p>
              <p className="text-xs mt-1 text-slate-400">Share your material to help other students.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myNotes.map((note) => (
                <div key={note._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {note.subject} • Semester {note.semester} • {note.downloadCount || 0} downloads • {note.upvotes?.length || 0} upvotes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInAppDownload(note)}
                      className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          savedNotes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No saved notes</p>
              <p className="text-xs mt-1 text-slate-400">Click the bookmark icon on any note to save it here for quick access.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {savedNotes.map((note) => (
                <div key={note._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {note.subject} • Semester {note.semester} • Uploaded by {note.uploadedBy?.name || 'Peer'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInAppDownload(note)}
                      className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(note._id)}
                      className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
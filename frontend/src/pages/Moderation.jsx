import { useCallback, useEffect, useState } from 'react';
import API from '../api/client';
import { Eye, Check, X, ShieldCheck, Flag, RefreshCw, FileText } from 'lucide-react';
import PdfPreviewModal from '../components/PdfPreviewModal';

const reportReasonLabel = {
  copyright: 'Copyright or unauthorized material',
  inappropriate: 'Inappropriate or harmful content',
  misleading: 'Misleading or unrelated resource',
  personal_information: 'Contains personal information',
  other: 'Other concern'
};

export default function Moderation() {
  const [queue, setQueue] = useState({ pendingNotes: [], openReports: [] });
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState('');
  const [error, setError] = useState('');
  const [previewNote, setPreviewNote] = useState(null);

  const loadQueue = useCallback(async () => {
    try {
      const { data } = await API.get('/notes/moderation/queue');
      setQueue(data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the moderation queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const reviewNote = async (noteId, decision) => {
    const moderationNote = decision === 'rejected'
      ? window.prompt('Optional: add a short reason for rejecting this resource.', '') ?? null
      : '';
    if (moderationNote === null) return;

    setBusyItem(noteId);
    setError('');
    try {
      await API.patch(`/notes/moderation/notes/${noteId}`, { decision, note: moderationNote });
      await loadQueue();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review this resource.');
    } finally {
      setBusyItem('');
    }
  };

  const reviewReport = async (reportId, decision) => {
    setBusyItem(reportId);
    setError('');
    try {
      await API.patch(`/notes/moderation/reports/${reportId}`, { decision });
      await loadQueue();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this report.');
    } finally {
      setBusyItem('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#193a34] px-6 py-8 text-[#f6f1e4] sm:px-10 sm:py-10">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b487]"><ShieldCheck className="h-4 w-4" /> NoteNest stewardship</p>
            <h1 className="editorial-heading mt-2 text-4xl sm:text-5xl">Moderation desk</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#d3d9cd]">Review new contributions and community reports before they affect the shared library.</p>
          </div>
          <button onClick={() => { setLoading(true); loadQueue(); }} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-[#f6f1e4] transition hover:bg-white/10 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh queue
          </button>
        </div>
      </header>

      {error && <div role="alert" className="mt-5 rounded-xl border border-[#c88778]/40 bg-[#f7e9e4] px-4 py-3 text-sm text-[#884b40]">{error}</div>}

      <section className="mt-9">
        <div className="mb-4 flex items-end justify-between border-b border-[#d9d5ca] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ad8950]">First review</p>
            <h2 className="editorial-heading mt-1 text-3xl text-[#23343a]">New resources</h2>
          </div>
          <span className="rounded-full bg-[#f1ead9] px-3 py-1 text-xs font-semibold text-[#795f37]">{queue.pendingNotes.length} pending</span>
        </div>

        {loading ? (
          <div className="paper-panel rounded-2xl p-10 text-center text-sm text-[#687478]">Loading resources for review…</div>
        ) : queue.pendingNotes.length === 0 ? (
          <div className="paper-panel rounded-2xl p-8 text-sm text-[#687478]">There are no new resources to review.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {queue.pendingNotes.map((note) => (
              <article key={note._id} className="paper-panel rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9ede4] text-[#42614d]"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="editorial-heading line-clamp-2 text-2xl text-[#23343a]">{note.title}</h3>
                    <p className="mt-1 text-sm text-[#687478]">{note.subject} · Semester {note.semester} · {note.department}</p>
                    <p className="mt-2 text-xs text-[#818780]">Submitted by {note.uploadedBy?.name || 'Unknown contributor'} · {note.uploadedBy?.college || 'No institution listed'}</p>
                    <p className="mt-1 text-xs text-[#818780]">{note.fileName} · {(note.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
                    {note.tags?.length > 0 && <p className="mt-2 text-xs text-[#42614d]">{note.tags.map((tag) => `#${tag}`).join('  ')}</p>}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#eeeae1] pt-4">
                  <button onClick={() => setPreviewNote(note)} className="inline-flex items-center gap-2 rounded-lg border border-[#dedbd1] px-3.5 py-2 text-xs font-semibold text-[#687478] transition hover:bg-[#f0eee6] hover:text-[#244b43]">
                    <Eye className="h-4 w-4" /> Inspect PDF
                  </button>
                  <button onClick={() => reviewNote(note._id, 'rejected')} disabled={busyItem === note._id} className="inline-flex items-center gap-2 rounded-lg border border-[#d7aaa0] px-3.5 py-2 text-xs font-semibold text-[#914c3f] transition hover:bg-[#f7e9e4] disabled:opacity-60">
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button onClick={() => reviewNote(note._id, 'approved')} disabled={busyItem === note._id} className="inline-flex items-center gap-2 rounded-lg bg-[#244b43] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#193a34] disabled:opacity-60">
                    <Check className="h-4 w-4" /> Approve & award 10 credits
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between border-b border-[#d9d5ca] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ad8950]">Community feedback</p>
            <h2 className="editorial-heading mt-1 text-3xl text-[#23343a]">Reported resources</h2>
          </div>
          <span className="rounded-full bg-[#f7e9e4] px-3 py-1 text-xs font-semibold text-[#914c3f]">{queue.openReports.length} open</span>
        </div>
        {loading ? (
          <div className="paper-panel rounded-2xl p-10 text-center text-sm text-[#687478]">Loading reports…</div>
        ) : queue.openReports.length === 0 ? (
          <div className="paper-panel rounded-2xl p-8 text-sm text-[#687478]">There are no open reports.</div>
        ) : (
          <div className="space-y-3">
            {queue.openReports.map((report) => (
              <article key={report._id} className="paper-panel rounded-2xl p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#914c3f]"><Flag className="h-3.5 w-3.5" /> {reportReasonLabel[report.reason] || report.reason}</p>
                    <h3 className="mt-2 truncate text-sm font-semibold text-[#23343a]">{report.note?.title || 'Resource no longer exists'}</h3>
                    <p className="mt-1 text-xs text-[#818780]">Reported by {report.reporter?.name || 'A community member'} · {report.note?.uploadedBy?.name || 'Unknown contributor'}</p>
                    {report.details && <p className="mt-3 max-w-3xl whitespace-pre-wrap rounded-xl bg-[#f3f1e9] px-4 py-3 text-sm leading-6 text-[#536166]">{report.details}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {report.note && <button onClick={() => setPreviewNote(report.note)} className="inline-flex items-center gap-2 rounded-lg border border-[#dedbd1] px-3 py-2 text-xs font-semibold text-[#687478] transition hover:bg-[#f0eee6]"><Eye className="h-4 w-4" /> Inspect</button>}
                    <button onClick={() => reviewReport(report._id, 'dismissed')} disabled={busyItem === report._id} className="rounded-lg border border-[#dedbd1] px-3 py-2 text-xs font-semibold text-[#687478] transition hover:bg-[#f0eee6] disabled:opacity-60">Dismiss</button>
                    <button onClick={() => reviewReport(report._id, 'resolved')} disabled={busyItem === report._id} className="inline-flex items-center gap-2 rounded-lg bg-[#914c3f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#783d33] disabled:opacity-60"><Check className="h-4 w-4" /> Remove resource</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <PdfPreviewModal note={previewNote} isOpen={Boolean(previewNote)} onClose={() => setPreviewNote(null)} />
    </div>
  );
}

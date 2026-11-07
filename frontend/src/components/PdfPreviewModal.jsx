import { X, Download, FileText, School, Calendar } from 'lucide-react';

export default function PdfPreviewModal({ note, isOpen, onClose, onDownload }) {
  if (!isOpen || !note) return null;

  // Ensure backend URL has no trailing slash and note.fileUrl has a leading slash
  const rawBackend = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const backendUrl = rawBackend.replace(/\/+$/, '');
  const filePath = typeof note.fileUrl === 'string' ? note.fileUrl.trim() : '';
  const cleanPath = filePath
    ? filePath.startsWith('/') ? filePath : `/${filePath}`
    : '';
  const fileUrl = cleanPath ? `${backendUrl}${cleanPath}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight line-clamp-1">
                {note.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{note.subject}</span>
                <span>•</span>
                <span>Sem {note.semester}</span>
                <span>•</span>
                <span>{note.department}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(note)}
              className="flex items-center gap-1.5 neon-btn text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 relative">
          {fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              title={note.title || 'PDF preview'}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-400">
              Preview is unavailable because this note has no file attached.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-500" />
              {note.uploadedBy?.college || 'Institute'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Uploaded by {note.uploadedBy?.name || 'Anonymous'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-indigo-400">{note.downloadCount || 0}</span> total downloads
          </div>
        </div>

      </div>
    </div>
  );
}
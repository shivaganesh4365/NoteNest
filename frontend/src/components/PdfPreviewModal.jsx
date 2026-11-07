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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c2927]/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="PDF preview">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#d8d2c3] bg-[#fbfaf6] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e3dfd5] bg-[#fbfaf6] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d7d1c2] bg-[#f0eee6] text-[#42614d]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="line-clamp-1 text-sm font-semibold text-[#23343a] sm:text-base">
                {note.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#818780]">
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
              className="flex items-center gap-1.5 rounded-lg bg-[#244b43] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#193a34] sm:px-4"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#818780] transition hover:bg-[#eeeae1] hover:text-[#23343a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="relative flex-1 bg-[#e7e5df]">
          {fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              title={note.title || 'PDF preview'}
              className="h-full w-full border-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#687478]">
              Preview is unavailable because this note has no file attached.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e3dfd5] bg-[#fbfaf6] px-4 py-3 text-xs text-[#687478] sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <School className="h-3.5 w-3.5 text-[#ad8950]" />
              {note.uploadedBy?.college || 'Institute'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#ad8950]" />
              Uploaded by {note.uploadedBy?.name || 'Anonymous'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-[#42614d]">{note.downloadCount || 0}</span> total downloads
          </div>
        </div>

      </div>
    </div>
  );
}
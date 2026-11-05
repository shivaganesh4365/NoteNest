import { X, Download, FileText, School, Calendar } from 'lucide-react';

export default function PdfPreviewModal({ note, isOpen, onClose, onDownload }) {
  if (!isOpen || !note) return null;

  const fileUrl = `http://localhost:5000${note.fileUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1">
                {note.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>{note.subject}</span>
                <span>•</span>
                <span>Semester {note.semester}</span>
                <span>•</span>
                <span>{note.department}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(note)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF Viewer */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title={note.title}
            className="w-full h-full border-none"
          />
        </div>

        {/* Modal Footer: Metadata */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-400" />
              {note.uploadedBy?.college || 'University Student'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Uploaded by {note.uploadedBy?.name || 'Anonymous'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">{note.downloadCount || 0}</span> total downloads
          </div>
        </div>

      </div>
    </div>
  );
}
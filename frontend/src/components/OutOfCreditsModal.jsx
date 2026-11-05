import { Link } from 'react-router-dom';
import { UploadCloud, Coins, X } from 'lucide-react';

export default function OutOfCreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Coins className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">Out of Credits</h3>
        <p className="text-sm text-slate-600 mt-2">
          Downloading this note costs <strong className="text-slate-800">2 Credits</strong>. Share your study material to earn <strong className="text-emerald-600">+10 Credits</strong> instantly!
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm text-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notes (+10 Credits)</span>
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 font-semibold py-2 hover:text-slate-700 transition"
          >
            Browse Other Notes
          </button>
        </div>
      </div>
    </div>
  );
}
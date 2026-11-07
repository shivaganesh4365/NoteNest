import { Link } from 'react-router-dom';
import { UploadCloud, Coins, X } from 'lucide-react';

export default function OutOfCreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c2927]/60 p-4 backdrop-blur-sm">
      <div className="paper-panel relative w-full max-w-sm rounded-2xl p-7 text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#818780] transition hover:bg-[#eeeae1] hover:text-[#23343a]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4c393] bg-[#f2ead6] text-[#9a7946]">
          <Coins className="w-7 h-7" />
        </div>

        <h3 className="editorial-heading text-3xl text-[#23343a]">A small pause.</h3>
        <p className="mt-3 text-sm leading-6 text-[#687478]">
          This download uses <strong className="text-[#35464a]">2 credits</strong>. Share a useful resource and earn <strong className="text-[#42614d]">10 credits</strong> for your contribution.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#244b43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#193a34]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notes (+10 Credits)</span>
          </Link>
          <button
            onClick={onClose}
            className="py-2 text-xs font-semibold text-[#818780] transition hover:text-[#23343a]"
          >
            Browse Other Notes
          </button>
        </div>
      </div>
    </div>
  );
}
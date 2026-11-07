import { useState } from 'react';
import API from '../api/client';
import { Flag, X, Loader2 } from 'lucide-react';

const reasons = [
  ['copyright', 'Copyright or unauthorized material'],
  ['inappropriate', 'Inappropriate or harmful content'],
  ['misleading', 'Misleading or unrelated resource'],
  ['personal_information', 'Contains personal information'],
  ['other', 'Other concern']
];

export default function ReportResourceModal({ note, onClose, onReported }) {
  const [reason, setReason] = useState('copyright');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!note) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await API.post(`/notes/${note._id}/report`, { reason, details });
      onReported();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c2927]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-resource-title">
      <div className="paper-panel relative w-full max-w-lg rounded-2xl p-6 sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-[#818780] transition hover:bg-[#eeeae1] hover:text-[#23343a]" aria-label="Close report dialog">
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7e9e4] text-[#914c3f]">
          <Flag className="h-5 w-5" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#ad8950]">Community review</p>
        <h2 id="report-resource-title" className="editorial-heading mt-1 text-3xl text-[#23343a]">Report this resource</h2>
        <p className="mt-2 line-clamp-2 text-sm text-[#687478]">{note.title}</p>

        {error && <div role="alert" className="mt-4 rounded-xl border border-[#c88778]/40 bg-[#f7e9e4] px-4 py-3 text-sm text-[#884b40]">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-[#35464a]">What is the concern?</legend>
            <div className="space-y-2">
              {reasons.map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${reason === value ? 'border-[#7b9588] bg-[#edf2e9] text-[#244b43]' : 'border-[#e3dfd5] bg-[#fbfaf6] text-[#687478] hover:border-[#c5c6b8]'}`}>
                  <input type="radio" name="report-reason" value={value} checked={reason === value} onChange={(event) => setReason(event.target.value)} className="accent-[#244b43]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="report-details" className="mb-2 block text-sm font-semibold text-[#35464a]">Additional context <span className="font-normal text-[#89918b]">(optional)</span></label>
            <textarea id="report-details" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={3} placeholder="Share details that will help moderators review this resource." className="classic-input resize-y px-4 py-3 text-sm" />
            <p className="mt-1 text-right text-[11px] text-[#89918b]">{details.length}/1000</p>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#687478] transition hover:bg-[#eeeae1]">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#914c3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#783d33] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Flag className="h-4 w-4" /> Send report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

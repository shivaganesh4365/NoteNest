import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['copyright', 'inappropriate', 'misleading', 'personal_information', 'other'],
      required: true
    },
    details: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open'
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

reportSchema.index({ note: 1, reporter: 1 }, { unique: true });

export default mongoose.model('Report', reportSchema);

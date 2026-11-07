import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    department: { type: String, default: 'General' },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    lastAccessedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
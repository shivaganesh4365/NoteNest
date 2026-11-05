import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    college: { type: String, default: 'University' },
    credits: { type: Number, default: 6 }, // 3 free downloads upon registration
    downloadedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
import mongoose, { Schema } from 'mongoose';

const uploadSchema = new Schema({
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for batch uploads
  },
  class: {
    type: Number,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true // e.g., 'pdf', 'jpg', etc.
  },
  type: {
    type: String,
    enum: ['individual', 'batch'],
    required: true
  }
}, { timestamps: true });

// Indexes for better query performance
uploadSchema.index({ uploader: 1 });
uploadSchema.index({ student: 1 });
uploadSchema.index({ class: 1 });
uploadSchema.index({ batch: 1 });

export const Upload = mongoose.model('Upload', uploadSchema);
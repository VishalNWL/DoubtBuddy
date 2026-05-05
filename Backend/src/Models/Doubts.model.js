import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const doubtSchema = new Schema({
  questionDescription: {
    type: String,
  },
  
    studentname:{
      type:String,
      required:true
    }
  ,
  title: {
    type: String,
    required:true
  },
   schoolId: {
      type: String,
      required: true
    },

  questionFile: {
    type: String, // Cloudinary URL
  },

  askedBy:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  subject: {
    type: String,
    required: true
  },
  class:{
    type:Number,
    required:true
  },
  batch:{
    type:String,
    required:true
  },
  status: {
    type: String,
    enum: ['unanswered', 'answered'],
    default: 'unanswered'
  },

  answeredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  answerText: {
    type: String,
    default: null
  },
  answerPhoto: {
    type: String, // Cloudinary URL
    default: null
  },
  answerVideo:{
    type:String,
    default:null
  }

  
},{timestamps:true});

// Indexes for better query performance
doubtSchema.index({ schoolId: 1 });
doubtSchema.index({ askedBy: 1 });
doubtSchema.index({ subject: 1 });
doubtSchema.index({ class: 1 });
doubtSchema.index({ batch: 1 });
doubtSchema.index({ status: 1 });

export const Doubt = mongoose.model('Doubt', doubtSchema);

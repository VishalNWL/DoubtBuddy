import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const doubtSchema = new Schema({
  questionDescription: {
    type: String,
    required: true
  },

  questionFile: {
    type: String, // Cloudinary URL
    required: false
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

export const Doubt = mongoose.model('Doubt', doubtSchema);

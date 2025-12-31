import mongoose, {Schema} from 'mongoose'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    index: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  forget_password_otp:{
     type:String,
     default:null
  },
  forget_password_expiry:{
      type:Date,
      default:""
  },
  
  avatar: {
    type: String,//coudinary url
    default:""
  },

  role: {
    type: String,
    enum: ['student', 'teacher','admin'],
    required: true
  },
  
status: {
     type:String,
     enum:['active','pending','rejected'],
     default:'pending'
  },

  school: { type: String,
     required: function () {
      return this.role !== 'admin';
    },
    
    trim: true 
  },

  // Student-only
    class: {
    type: Number,
    required: function () {
      return this.role === 'student';
    }
  },

  batch: {
    type: String,
    required: function () {
      return this.role === 'student';
    }
  },

  stream: {
    type: String,
    default: null
  },

  optionalSubject: {
    type: String,
    default: null
  },

  AskedQuestions:{
      type:[{type: Schema.Types.ObjectId, ref: 'Doubt' }],
      default:[]
  },

  // Teacher-only

teacherClasses: {
  type: [
    {
      class: { type: Number },
      subject:{ type: String },
      batch:{ type: String }
    }
  ],
  default: []
},
answeredQuestions: {
  type: [{ type: Schema.Types.ObjectId, ref: 'Doubt' }],
  default: []
}

}, { timestamps: true });


userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next();
})

//here we added our own method
userSchema.methods.isPasswordCorrect = async function(password) {
  const check=await bcrypt.compare(password, this.password);
  return check
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullname: this.fullname,
      email: this.email

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


export const User = mongoose.model('User', userSchema);

import mongoose, {Schema} from 'mongoose'

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
  
  avatar: {
    type: String,//coudinary url
    required: function () {
      return this.role !== 'admin';
    }
  },

  coverImage: {
    type: String //cloudinary url
  },

  role: {
    type: String,
    enum: ['student', 'teacher','admin'],
    required: true
  },

  school: { type: String,
     required: function () {
      return this.role !== 'admin';
    },
    
    trim: true 
  },

  // Student-only
  class: {
    type: String,
    required: function () {
      return this.role === 'student';
    }
  },

  // Teacher-only

teacherClasses: {
  type: [
    {
      class: { type: String },
      subject: [{ type: String }],
      batches: [{ type: String }]
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
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = function () {
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

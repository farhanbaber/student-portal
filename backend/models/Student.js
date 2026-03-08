import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactNo: {
      type: String,
      required: true,
      trim: true,
    },
    expectedSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    graduation: {
      type: String,
      required: true,
      trim: true,
    },
    workingPlan: {
      type: String,
      required: true,
      enum: ['Full-Time', 'Remote'],
    },
    photoPath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Student =
  mongoose.models.Student || mongoose.model('Student', studentSchema)


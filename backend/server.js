import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import multer from 'multer'
import path from 'path'
import fs from 'fs' 
import { fileURLToPath } from 'url'
import { Student } from './models/Student.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express() // Pehle app define kiya

// 1. Middlewares
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: '*', 
    methods: ['GET', 'POST'],
  })
)

app.use(express.json())

// 2. ROOT ROUTE (Ab ye sahi jagah par hai)
app.get('/', (req, res) => {
  res.send('<h1>Student Portal Backend is Live! 🚀</h1><p>API is working perfectly.</p>');
});

// 3. Static Files & Uploads logic
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/\s+/g, '-')
    cb(null, `${timestamp}-${safeName}`)
  },
})

const upload = multer({ storage })

// 4. API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Student API is running' })
})

app.get('/api/students', async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean()
    return res.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return res.status(500).json({
      message: 'Failed to fetch students.',
    })
  }
})

app.post('/api/submit', upload.single('graduationPhoto'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNo,
      expectedSalary,
      graduation,
      workingPlan,
    } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Graduation photo is required.' })
    }

    const photoPath = `/uploads/${req.file.filename}`

    const student = new Student({
      fullName,
      email,
      contactNo,
      expectedSalary: Number(expectedSalary),
      graduation,
      workingPlan,
      photoPath,
    })

    await student.save()

    return res.status(201).json({
      message: 'Application submitted successfully.',
      studentId: student._id,
    })
  } catch (error) {
    console.error('Error saving student:', error)
    return res.status(500).json({
      message: 'Failed to submit application.',
      error: error.message
    })
  }
})

// 5. Start Server logic
async function start() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('MONGO_URI is not set!')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB Atlas')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error)
    process.exit(1)
  }
}

start()
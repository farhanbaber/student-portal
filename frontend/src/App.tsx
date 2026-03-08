import { useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types & Interfaces ---
type WorkingPlan = 'Full-Time' | 'Remote'

interface FormState {
  fullName: string
  email: string
  contactNo: string
  expectedSalary: string
  graduation: string
  workingPlan: WorkingPlan | ''
  graduationPhoto: File | null
}

interface Student {
  _id: string
  fullName: string
  email: string
  contactNo: string
  expectedSalary: number
  graduation: string
  workingPlan: WorkingPlan
  photoPath: string
  createdAt: string
}

const initialFormState: FormState = {
  fullName: '',
  email: '',
  contactNo: '',
  expectedSalary: '',
  graduation: '',
  workingPlan: '',
  graduationPhoto: null,
}

const API_BASE_URL = 'https://student-portal-production-a736.up.railway.app'

function App() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [activeView, setActiveView] = useState<'form' | 'dashboard'>('form')
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false)

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null)

  // Handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setForm(prev => ({ ...prev, graduationPhoto: file }))
  }

  const fetchStudents = async () => {
    setErrorMessage('')
    try {
      setLoadingStudents(true)
      const response = await axios.get<Student[]>(`${API_BASE_URL}/api/students`, { timeout: 15000 })
      setStudents(response.data)
    } catch (error) {
      setErrorMessage('Failed to load data. Check backend.')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')

    if (!isAuthenticated) return setErrorMessage('Please login first.')
    if (!form.graduationPhoto) return setErrorMessage('Upload photo.')

    try {
      setSubmitting(true)
      const data = new FormData()
      
      // Har field ko manually append kar rahe hain taake koi data miss na ho
      data.append('fullName', form.fullName)
      data.append('email', form.email)
      data.append('contactNo', form.contactNo)
      data.append('expectedSalary', form.expectedSalary)
      data.append('graduation', form.graduation)
      data.append('workingPlan', form.workingPlan)
      data.append('graduationPhoto', form.graduationPhoto)

      const response = await axios.post(`${API_BASE_URL}/api/submit`, data)
      console.log("Success:", response.data)
      
      setSuccessMessage('Application Submitted Successfully!')
      setForm(initialFormState)
      
      // Input file reset
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err: any) {
      console.error("Submission Error:", err.response?.data || err.message)
      setErrorMessage(err.response?.data?.message || 'Error submitting form.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-4xl shadow-2xl"
      >
        {/* Header & View Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Student Portal</h1>
                <p className="text-slate-500 text-sm">Manage your applications easily</p>
            </div>
            <div className="flex gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                <button 
                    onClick={() => setActiveView('form')}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === 'form' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Application Form
                </button>
                <button 
                    onClick={() => { setActiveView('dashboard'); fetchStudents(); }}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Dashboard
                </button>
            </div>
        </div>

        <hr className="border-slate-800 mb-8" />

        {activeView === 'form' ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Full Name</label>
                <input name="fullName" placeholder="Enter full name" onChange={handleChange} value={form.fullName} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Email Address</label>
                <input name="email" type="email" placeholder="email@example.com" onChange={handleChange} value={form.email} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Contact Number</label>
                <input name="contactNo" placeholder="03XXXXXXXXX" onChange={handleChange} value={form.contactNo} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Expected Salary</label>
                <input name="expectedSalary" type="number" placeholder="e.g. 50000" onChange={handleChange} value={form.expectedSalary} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Graduation / Degree</label>
                <input name="graduation" placeholder="e.g. BSCS or Matric" onChange={handleChange} value={form.graduation} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Working Plan</label>
                <select name="workingPlan" onChange={handleChange} value={form.workingPlan} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer" required>
                    <option value="" className="bg-slate-900">Select Plan</option>
                    <option value="Full-Time" className="bg-slate-900">Full-Time</option>
                    <option value="Remote" className="bg-slate-900">Remote</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-500 ml-1">Graduation Photo / Certificate</label>
                <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 p-4 rounded-xl hover:border-blue-500/50 transition-colors">
                    <input name="graduationPhoto" type="file" onChange={handleFileChange} className="text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white file:font-bold file:cursor-pointer" required />
                </div>
            </div>
            
            <button 
                type="submit" 
                disabled={submitting} 
                className="md:col-span-2 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                </span>
              ) : 'Submit Application'}
            </button>

            {!isAuthenticated && (
              <div className="absolute -inset-2 bg-slate-950/60 backdrop-blur-[6px] flex flex-col items-center justify-center rounded-3xl z-10 border border-white/5">
                <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center max-w-xs">
                    <h3 className="text-xl font-bold mb-2">Welcome Back!</h3>
                    <p className="text-slate-400 text-sm mb-6">Please sign in to your demo account to start submitting applications.</p>
                    <button type="button" onClick={() => setIsAuthenticated(true)} className="w-full bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Demo Login
                    </button>
                </motion.div>
              </div>
            )}
          </form>
        ) : (
          <div className="text-white">
            {loadingStudents ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                 <p className="text-slate-500 animate-pulse">Fetching records...</p>
               </div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <p>No records found. Submit your first application!</p>
                </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Student Name</th>
                            <th className="p-4 font-semibold">Graduation</th>
                            <th className="p-4 font-semibold">Plan</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {students.map(s => (
                        <tr key={s._id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4">
                            <div className="font-medium text-slate-200">{s.fullName}</div>
                            <div className="text-xs text-slate-500">{s.email}</div>
                        </td>
                        <td className="p-4 text-sm">{s.graduation}</td>
                        <td className="p-4">
                            <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${s.workingPlan === 'Remote' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {s.workingPlan}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <button 
                                onClick={() => setPhotoModalUrl(`${API_BASE_URL}${s.photoPath}`)}
                                className="bg-slate-800 hover:bg-blue-600 p-2 px-4 rounded-lg text-xs transition-all border border-slate-700"
                            >
                                View Photo
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        <AnimatePresence>
            {successMessage && (
                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0}} className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-emerald-500 text-sm font-medium">{successMessage}</p>
                </motion.div>
            )}
            {errorMessage && (
                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0}} className="mt-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <p className="text-rose-500 text-sm font-medium">{errorMessage}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* Image Modal Preview */}
      <AnimatePresence>
        {photoModalUrl && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setPhotoModalUrl(null)}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-5xl w-full flex justify-center"
            >
                <img src={photoModalUrl} alt="Preview" className="max-h-[85vh] rounded-xl shadow-2xl border border-white/10" />
                <button className="absolute top-[-40px] right-0 text-white hover:text-blue-400 font-bold">Close Preview [×]</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
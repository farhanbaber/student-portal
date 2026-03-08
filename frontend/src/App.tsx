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

  // Dashboard Privacy Logic
  const handleDashboardAccess = () => {
    const password = prompt('Enter Admin Password to access Dashboard:');
    if (password === 'farhan123') { // Aap password yahan badal sakte hain
      setActiveView('dashboard');
      fetchStudents();
    } else {
      alert('Wrong Password! Only Farhan can access this.');
    }
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
      data.append('fullName', form.fullName)
      data.append('email', form.email)
      data.append('contactNo', form.contactNo)
      data.append('expectedSalary', form.expectedSalary)
      data.append('graduation', form.graduation)
      data.append('workingPlan', form.workingPlan)
      data.append('graduationPhoto', form.graduationPhoto)

      const response = await axios.post(`${API_BASE_URL}/api/submit`, data)
      setSuccessMessage('Application Submitted Successfully!')
      setForm(initialFormState)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error submitting form.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center p-4 font-sans text-slate-200">
      
      {/* 1. Glassmorphic Heading Section */}
      <header className="sticky top-4 z-40 w-full max-w-4xl mb-8">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
              STUDENT PORTAL
            </h1>
            <p className="text-slate-400 text-xs font-medium tracking-[0.2em] uppercase mt-1">Next-Gen Management System</p>
          </div>
          
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
            <button 
                onClick={() => setActiveView('form')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeView === 'form' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`}
            >
                FORM
            </button>
            <button 
                onClick={handleDashboardAccess}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`}
            >
                DASHBOARD
            </button>
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/80 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl backdrop-blur-sm"
      >
        {activeView === 'form' ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
             {/* Form Fields (Same as yours but with polished spacing) */}
             <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Full Name</label>
                <input name="fullName" placeholder="Enter full name" onChange={handleChange} value={form.fullName} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Email Address</label>
                <input name="email" type="email" placeholder="email@example.com" onChange={handleChange} value={form.email} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Contact Number</label>
                <input name="contactNo" placeholder="03XXXXXXXXX" onChange={handleChange} value={form.contactNo} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Expected Salary</label>
                <input name="expectedSalary" type="number" placeholder="e.g. 50000" onChange={handleChange} value={form.expectedSalary} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Graduation</label>
                <input name="graduation" placeholder="e.g. BSCS" onChange={handleChange} value={form.graduation} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" required />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Working Plan</label>
                <select name="workingPlan" onChange={handleChange} value={form.workingPlan} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer" required>
                    <option value="" className="bg-slate-900">Select Plan</option>
                    <option value="Full-Time" className="bg-slate-900">Full-Time</option>
                    <option value="Remote" className="bg-slate-900">Remote</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Upload Photo</label>
                <div className="bg-blue-500/5 border-2 border-dashed border-blue-500/20 p-6 rounded-2xl hover:bg-blue-500/10 transition-all group">
                    <input name="graduationPhoto" type="file" onChange={handleFileChange} className="text-slate-400 text-sm file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-bold file:cursor-pointer group-hover:file:bg-blue-500 transition-all" required />
                </div>
            </div>
            
            <button 
                type="submit" 
                disabled={submitting} 
                className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-5 rounded-[1.5rem] text-white font-black tracking-widest transition-all shadow-xl shadow-blue-900/30 active:scale-[0.98] disabled:opacity-50 mt-4 uppercase"
            >
              {submitting ? 'Submitting...' : 'Send Application'}
            </button>

            {/* Login Overlay */}
            {!isAuthenticated && (
              <div className="absolute -inset-4 bg-slate-950/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem] z-20">
                <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl text-center max-w-sm">
                    <h3 className="text-2xl font-black mb-2">RESTRICTED</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Unlock the portal to submit your student credentials.</p>
                    <button type="button" onClick={() => setIsAuthenticated(true)} className="w-full bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-blue-400 transition-all uppercase tracking-tighter">
                        Authorize Now
                    </button>
                </motion.div>
              </div>
            )}
          </form>
        ) : (
          /* 3. Responsive Dashboard */
          <div className="text-white">
            {loadingStudents ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                 <p className="text-slate-500 font-bold tracking-widest animate-pulse">SYNCING DATA...</p>
               </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile View: Cards | Desktop View: Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                          <tr>
                              <th className="p-5">Name</th>
                              <th className="p-5">Graduation</th>
                              <th className="p-5">Plan</th>
                              <th className="p-5 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                      {students.map(s => (
                          <tr key={s._id} className="hover:bg-white/5 transition-colors">
                            <td className="p-5">
                                <div className="font-bold text-slate-200">{s.fullName}</div>
                                <div className="text-xs text-slate-500">{s.email}</div>
                            </td>
                            <td className="p-5 text-sm font-medium">{s.graduation}</td>
                            <td className="p-5">
                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${s.workingPlan === 'Remote' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                    {s.workingPlan}
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <button onClick={() => setPhotoModalUrl(`${API_BASE_URL}${s.photoPath}`)} className="bg-white/5 hover:bg-white/10 p-2 px-5 rounded-xl text-[10px] font-bold transition-all border border-white/10 uppercase">View</button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {students.map(s => (
                    <div key={s._id} className="bg-slate-800/40 border border-slate-700 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{s.fullName}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </div>
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${s.workingPlan === 'Remote' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {s.workingPlan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <span className="text-xs text-slate-400">Graduation: <b className="text-slate-200">{s.graduation}</b></span>
                        <button onClick={() => setPhotoModalUrl(`${API_BASE_URL}${s.photoPath}`)} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold">Photo</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <AnimatePresence>
            {successMessage && (
                <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{successMessage}</p>
                </motion.div>
            )}
            {errorMessage && (
                <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="mt-8 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{errorMessage}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* Image Modal Preview */}
      <AnimatePresence>
        {photoModalUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoModalUrl(null)} className="fixed inset-0 bg-black/98 z-[100] flex flex-col items-center justify-center p-4 cursor-zoom-out backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-4xl w-full">
                <img src={photoModalUrl} alt="Preview" className="max-h-[80vh] w-auto mx-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" />
                <p className="text-center mt-6 text-slate-500 text-xs font-bold tracking-[0.5em] uppercase">Click anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  )
}

export default App
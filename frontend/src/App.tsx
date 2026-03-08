import { useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types & Interfaces ---
type WorkingPlan = 'Full-Time' | 'Remote'

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

const API_BASE_URL = 'https://student-portal-production-a736.up.railway.app'

function App() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    expectedSalary: '',
    graduation: '',
    workingPlan: '',
    graduationPhoto: null as File | null,
  })

  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeView, setActiveView] = useState<'form' | 'dashboard'>('form')
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  // States for the Luxurious Admin Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, graduationPhoto: e.target.files?.[0] ?? null }))
  }

  const fetchStudents = async () => {
    setErrorMessage('')
    try {
      setLoadingStudents(true)
      const response = await axios.get<Student[]>(`${API_BASE_URL}/api/students`)
      setStudents(response.data)
    } catch (error) {
      setErrorMessage('Failed to load records.')
    } finally {
      setLoadingStudents(false)
    }
  }

  // Luxurious Auth Handler
  const handleAdminVerify = () => {
    if (adminPass === 'farhan123') {
      setIsAuthenticated(true)
      setShowAdminLogin(false)
      setActiveView('dashboard')
      fetchStudents()
      setAdminPass('')
    } else {
      alert('Ghalat Password! Sirf Farhan access kar sakta hai.')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.graduationPhoto) return setErrorMessage('Photo upload karein.')
    
    try {
      setSubmitting(true)
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value)
      })

      await axios.post(`${API_BASE_URL}/api/submit`, data)
      setSuccessMessage('Application Submitted Successfully! ✅')
      setForm({ fullName: '', email: '', contactNo: '', expectedSalary: '', graduation: '', workingPlan: '', graduationPhoto: null })
    } catch (err: any) {
      setErrorMessage('Error submitting application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- Sticky Glass Header --- */}
      <header className="sticky top-0 z-40 w-full px-4 pt-6 pb-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 md:p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x tracking-tight">
              STUDENT PORTAL
            </h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">Premium Management</p>
          </div>

          <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
            <button 
              onClick={() => setActiveView('form')}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeView === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              APPLY
            </button>
            <button 
              onClick={() => isAuthenticated ? (setActiveView('dashboard'), fetchStudents()) : setShowAdminLogin(true)}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black transition-all duration-500 transform hover:scale-105 active:scale-95 ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
            >
              DASHBOARD
            </button>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-10">
        <AnimatePresence mode="wait">
          {activeView === 'form' ? (
            <motion.div 
              key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-slate-900/40 border border-slate-800 p-6 md:p-10 rounded-[3rem] backdrop-blur-sm shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Farhan Baber' },
                  { label: 'Email Address', name: 'email', type: 'email', placeholder: 'farhan@example.com' },
                  { label: 'Contact No', name: 'contactNo', type: 'text', placeholder: '03XXXXXXXXX' },
                  { label: 'Expected Salary', name: 'expectedSalary', type: 'number', placeholder: '50000' },
                  { label: 'Graduation', name: 'graduation', type: 'text', placeholder: 'BS Computer Science' }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">{field.label}</label>
                    <input 
                      {...field} name={field.name} 
                      onChange={handleChange} 
                      className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700" 
                      required 
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Working Plan</label>
                  <select name="workingPlan" onChange={handleChange} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer" required>
                    <option value="" className="bg-slate-900">Choose Plan</option>
                    <option value="Full-Time" className="bg-slate-900">Full-Time</option>
                    <option value="Remote" className="bg-slate-900">Remote</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Verification Document</label>
                  <div className="group relative bg-blue-500/5 border-2 border-dashed border-blue-500/20 p-8 rounded-3xl hover:bg-blue-500/10 transition-all text-center">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
                    <p className="text-sm text-slate-400 font-medium group-hover:text-blue-400 transition-colors">
                      {form.graduationPhoto ? form.graduationPhoto.name : 'Click or Drag photo to upload'}
                    </p>
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 py-5 rounded-2xl text-white font-black tracking-widest uppercase shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Processing...' : 'Submit Application'}
                </button>
              </form>
            </motion.div>
          ) : (
            /* --- DASHBOARD VIEW --- */
            <motion.div 
              key="dash-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {loadingStudents ? (
                <div className="text-center py-20 animate-pulse text-blue-500 font-black tracking-[0.5em]">LOADING DATA...</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {students.map(s => (
                    <motion.div 
                      layout key={s._id} 
                      className="bg-slate-900/60 border border-slate-800 p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-xl">
                          {s.fullName[0]}
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-white">{s.fullName}</h3>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-slate-500 uppercase font-black">Plan</p>
                          <p className="text-sm font-bold text-blue-400">{s.workingPlan}</p>
                        </div>
                        <button 
                          onClick={() => setPhotoModalUrl(`${API_BASE_URL}${s.photoPath}`)}
                          className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-400 transition-all"
                        >
                          View Photo
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- LUXURIOUS ADMIN LOGIN OVERLAY --- */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full" />
              <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">ADMIN</h2>
              <p className="text-slate-500 text-xs mb-8 font-medium">Verify your identity to proceed</p>
              
              <input 
                type="password" placeholder="••••••••" 
                value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-center text-white outline-none focus:ring-2 focus:ring-blue-500/50 mb-6 transition-all"
              />

              <div className="flex gap-3">
                <button onClick={() => setShowAdminLogin(false)} className="flex-1 text-slate-500 text-[10px] font-black uppercase tracking-widest">Back</button>
                <button onClick={handleAdminVerify} className="flex-[2] bg-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Authorize</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Success/Error Toasts --- */}
      <AnimatePresence>
        {(successMessage || errorMessage) && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl ${successMessage ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
          >
            {successMessage || errorMessage}
            <button onClick={() => {setSuccessMessage(''); setErrorMessage('')}} className="ml-4 opacity-50">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Image Modal --- */}
      <AnimatePresence>
        {photoModalUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setPhotoModalUrl(null)}
            className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} 
              src={photoModalUrl} className="max-h-[85vh] rounded-[2rem] shadow-2xl border border-white/10" 
            />
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
          animation: gradient-x 5s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default App
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
  
  // States for the Luxurious Admin Auth & Modals
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
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
      setSuccessMessage('Application Submitted Successfully!')
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
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-xl">
                          {s.fullName[0]}
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-white">{s.fullName}</h3>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedStudent(s)}
                        className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-400 transition-all shadow-xl active:scale-95"
                      >
                        View Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- MODALS SECTION --- */}
      <AnimatePresence>
        {/* 1. Admin Login Overlay */}
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.15)] max-w-sm w-full text-center relative overflow-hidden"
            >
              <h2 className="text-3xl font-black text-white mb-2">ADMIN</h2>
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

        {/* 2. Professional Details Modal */}
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-10 flex flex-col items-center gap-6 text-center">
                <img 
                  src={`${API_BASE_URL}${selectedStudent.photoPath}`} 
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-white/20 shadow-2xl cursor-pointer hover:scale-105 transition-all" 
                  alt="Profile"
                  onClick={() => setPhotoModalUrl(`${API_BASE_URL}${selectedStudent.photoPath}`)}
                />
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{selectedStudent.fullName}</h2>
                  <p className="text-blue-100 text-sm opacity-70">{selectedStudent.email}</p>
                </div>
              </div>
              <div className="p-10 grid grid-cols-2 gap-8 bg-slate-900">
                {[
                  { label: 'Contact', value: selectedStudent.contactNo },
                  { label: 'Graduation', value: selectedStudent.graduation },
                  { label: 'Expected Salary', value: `Rs. ${selectedStudent.expectedSalary}` },
                  { label: 'Work Plan', value: selectedStudent.workingPlan },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-slate-200 font-bold text-lg">{item.value}</span>
                  </div>
                ))}
                <div className="col-span-2 pt-4">
                   <button 
                    onClick={() => setSelectedStudent(null)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. Success Green Glassmorphic Overlay */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-2xl p-12 rounded-[3rem] text-center max-w-sm w-full shadow-2xl"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/40">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">SUCCESS!</h3>
              <p className="text-emerald-200/70 text-sm mb-10 font-bold leading-relaxed">Your application has been received successfully.</p>
              <button 
                onClick={() => setSuccessMessage('')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-950 transition-all shadow-xl"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 4. Error Message Overlay */}
        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-rose-950/40 border border-rose-500/30 backdrop-blur-2xl p-10 rounded-[2.5rem] text-center max-w-sm w-full">
              <p className="text-rose-200 font-black mb-6 uppercase tracking-widest">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="bg-rose-500 px-10 py-3 rounded-xl text-xs font-black uppercase text-white">Retry</button>
            </div>
          </motion.div>
        )}

        {/* 5. Image Preview Modal */}
        {photoModalUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setPhotoModalUrl(null)}
            className="fixed inset-0 bg-black/98 z-[250] flex items-center justify-center p-4 backdrop-blur-3xl cursor-zoom-out"
          >
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={photoModalUrl} className="max-h-[85vh] rounded-[2.5rem] shadow-2xl border border-white/10" />
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
import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

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

const API_BASE_URL = 'http://localhost:5000'

export function App() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeView, setActiveView] = useState<'form' | 'dashboard'>('form')
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setForm(prev => ({ ...prev, graduationPhoto: file }))
  }

  const resetMessages = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  const fetchStudents = async () => {
    resetMessages()
    try {
      setLoadingStudents(true)
      const response = await axios.get<Student[]>(
        `${API_BASE_URL}/api/students`,
        {
          timeout: 10000,
        },
      )
      setStudents(response.data)
    } catch (_error) {
      setErrorMessage('Failed to load students. Please try again.')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSwitchView = (view: 'form' | 'dashboard') => {
    setActiveView(view)
    if (view === 'dashboard') {
      fetchStudents()
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticated(true)
    setShowLoginModal(false)
    setLoginEmail('')
    setLoginPassword('')
    setSuccessMessage('Logged in successfully. You can now submit the form.')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    resetMessages()
  }

  const openPhotoModal = (url: string) => {
    setPhotoModalUrl(url)
    setPhotoLoading(true)
  }

  const closePhotoModal = () => {
    setPhotoModalUrl(null)
    setPhotoLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!isAuthenticated) {
      setErrorMessage('Please login before submitting the application.')
      return
    }

    if (!form.graduationPhoto) {
      setErrorMessage('Please upload your graduation photo before submitting.')
      return
    }

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

      await axios.post(`${API_BASE_URL}/api/submit`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      })

      setSuccessMessage('Application submitted successfully!')
      setForm(initialFormState)
      const fileInput = document.getElementById(
        'graduationPhoto',
      ) as HTMLInputElement | null
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setErrorMessage('Request timed out. Please try again.')
        } else if (error.response) {
          setErrorMessage(
            error.response.data?.message ??
              'Server responded with an error. Please try again.',
          )
        } else if (error.request) {
          setErrorMessage(
            'Unable to reach the server. Is the backend running on port 5000?',
          )
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.')
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          className="card-glass rounded-3xl p-8 md:p-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                  Student Application Portal
                </h1>
                <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl">
                  Submit new applications or review all submitted students from a
                  single dashboard.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/70 px-4 py-3 rounded-2xl">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-xs font-semibold">
                    New
                  </div>
                  <div>
                    <p className="font-medium">Hiring for 2026 batch</p>
                    <p className="text-slate-400 text-xs">
                      Full-time & remote opportunities
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/70 px-4 py-2 rounded-2xl">
                  <div className="text-xs text-slate-300">
                    {isAuthenticated ? (
                      <span>Signed in as student</span>
                    ) : (
                      <span>Please sign in to fill the form</span>
                    )}
                  </div>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                      className="inline-flex items-center rounded-full bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-500"
                    >
                      Login / Sign up
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center rounded-2xl bg-slate-900/70 p-1 border border-slate-800/80">
              <button
                type="button"
                onClick={() => handleSwitchView('form')}
                className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl transition-all ${
                  activeView === 'form'
                    ? 'bg-slate-800 text-white shadow-soft'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Application Form
              </button>
              <button
                type="button"
                onClick={() => handleSwitchView('dashboard')}
                className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-slate-800 text-white shadow-soft'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Students Dashboard
              </button>
            </div>
          </div>

          {activeView === 'form' && (
            <form
              onSubmit={handleSubmit}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-6"
            >
            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-slate-200"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Sara Ahmed"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contactNo"
                  className="block text-sm font-medium text-slate-200"
                >
                  Contact No
                </label>
                <input
                  id="contactNo"
                  name="contactNo"
                  type="tel"
                  required
                  placeholder="+92 300 0000000"
                  value={form.contactNo}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="expectedSalary"
                  className="block text-sm font-medium text-slate-200"
                >
                  Expected Salary (Monthly)
                </label>
                <input
                  id="expectedSalary"
                  name="expectedSalary"
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 80000"
                  value={form.expectedSalary}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              <div className="space-y-2">
                <label
                  htmlFor="graduation"
                  className="block text-sm font-medium text-slate-200"
                >
                  Graduation
                </label>
                <select
                  id="graduation"
                  name="graduation"
                  required
                  value={form.graduation}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="" disabled>
                    Select your degree
                  </option>
                  <option value="BCS">BCS</option>
                  <option value="BSCS">BSCS</option>
                  <option value="BSE">BSE</option>
                  <option value="MCS">MCS</option>
                  <option value="MSCS">MSCS</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-200">
                  Working Plan
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['Full-Time', 'Remote'] as WorkingPlan[]).map(option => {
                    const isActive = form.workingPlan === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setForm(prev => ({ ...prev, workingPlan: option }))
                        }
                        className={`flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'border-primary-500 bg-primary-500/10 text-primary-100 shadow-soft'
                            : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-primary-500/60 hover:bg-slate-900/80'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="graduationPhoto"
                  className="block text-sm font-medium text-slate-200"
                >
                  Graduation Photo
                </label>
                <div className="relative flex items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 px-4 py-3">
                  <input
                    id="graduationPhoto"
                    name="graduationPhoto"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-primary-500 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Upload a clear, recent graduation photo (max ~5MB recommended).
                </p>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 mt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  By submitting this form you agree to our data usage policy. We
                  only use your information for recruitment and evaluation
                  purposes.
                </p>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:opacity-80"
                >
                  <span className="relative inline-flex items-center gap-2">
                    <span>{submitting ? 'Submitting' : 'Submit Application'}</span>
                  </span>
                </motion.button>
              </div>

              <AnimatePresence>
                {submitting && (
                  <motion.div
                    className="flex items-center gap-3 text-sm text-primary-100 bg-slate-900/70 border border-slate-700/80 rounded-xl px-4 py-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <motion.div
                      className="relative h-8 w-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-500/40 border-t-primary-400"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: 'linear',
                        }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full bg-primary-500/80"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.9, 1, 0.9],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                    <div>
                      <p className="font-medium leading-tight">
                        Submitting your application
                      </p>
                      <p className="text-xs text-primary-100/80">
                        Please wait a moment while we securely upload your details
                        and photo.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/80 text-xs font-semibold">
                      ✓
                    </span>
                    <p>{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/80 text-xs font-semibold">
                      !
                    </span>
                    <p>{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isAuthenticated && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md px-6 text-center">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Login required
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 mb-4 max-w-sm">
                    Please login or sign up before filling and submitting the
                    student application form.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-500"
                  >
                    Login / Sign up
                  </button>
                </div>
              )}
            </div>
          </form>
          )}

          {activeView === 'dashboard' && (
            <div className="mt-2 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs md:text-sm text-slate-300">
                  Review all submitted student applications. Click on "View photo"
                  to open each graduation image.
                </p>
                <button
                  type="button"
                  onClick={fetchStudents}
                  className="inline-flex items-center rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-primary-500/70 hover:text-white"
                >
                  Refresh list
                </button>
              </div>

              {loadingStudents ? (
                <div className="flex items-center gap-3 text-sm text-primary-100 bg-slate-900/70 border border-slate-700/80 rounded-xl px-4 py-3">
                  <motion.div
                    className="relative h-7 w-7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-500/40 border-t-primary-400"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                  <p>Loading students...</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead className="bg-slate-900/80">
                        <tr className="text-left text-slate-300">
                          <th className="px-4 py-3 font-medium">#</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium hidden md:table-cell">
                            Email
                          </th>
                          <th className="px-4 py-3 font-medium hidden md:table-cell">
                            Contact
                          </th>
                          <th className="px-4 py-3 font-medium">Graduation</th>
                          <th className="px-4 py-3 font-medium">Plan</th>
                          <th className="px-4 py-3 font-medium text-right">
                            Photo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center text-slate-400"
                            >
                              No applications found yet.
                            </td>
                          </tr>
                        ) : (
                          students.map((student, index) => (
                            <tr
                              key={student._id}
                              className="border-t border-slate-800/70 text-slate-200"
                            >
                              <td className="px-4 py-3 align-top">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="font-medium">
                                  {student.fullName}
                                </div>
                                <div className="md:hidden text-xs text-slate-400">
                                  {student.email}
                                </div>
                                <div className="md:hidden text-xs text-slate-500">
                                  {student.contactNo}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top hidden md:table-cell">
                                <div className="text-xs md:text-sm">
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top hidden md:table-cell">
                                <div className="text-xs md:text-sm">
                                  {student.contactNo}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="text-xs md:text-sm">
                                  {student.graduation}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">
                                  Expected: {student.expectedSalary}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-100">
                                  {student.workingPlan}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPhotoModal(
                                      `${API_BASE_URL}${student.photoPath}`,
                                    )
                                  }
                                  className="inline-flex items-center rounded-full bg-primary-600/90 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-primary-500"
                                >
                                  View photo
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-soft px-6 py-6"
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Student login
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Simple demo login – no real account required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-500 hover:text-slate-200 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="loginEmail"
                    className="block text-xs font-medium text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="loginPassword"
                    className="block text-xs font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter any demo password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-500"
                >
                  Login
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {photoModalUrl && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={closePhotoModal}
              className="absolute top-4 right-4 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Close
            </button>
            <motion.div
              className="max-w-3xl max-h-[80vh] w-full flex items-center justify-center"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {photoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="relative h-14 w-14"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-500/40 border-t-primary-400"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: 'linear',
                        }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full bg-primary-500/80"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.9, 1, 0.9],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                  </div>
                )}
                <img
                  src={photoModalUrl}
                  alt="Graduation photo"
                  onLoad={() => setPhotoLoading(false)}
                  className={`max-h-[80vh] max-w-full rounded-2xl shadow-soft border border-slate-800 object-contain transition-opacity ${
                    photoLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App


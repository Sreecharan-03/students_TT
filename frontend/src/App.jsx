import { useEffect, useRef, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  deleteSubmission,
  facultyLogin,
  facultySignup,
  fetchSubmissions,
  submitProject,
  toggleSubmissionStar,
} from './api'
import './App.css'

const authStorageKey = 'anurag_tt_faculty_auth'

const initialFormData = {
  name: '',
  rollNo: '',
  year: '',
  department: '',
  section: '',
  projectTitle: '',
  githubLink: '',
  liveLink: '',
}

const departmentSections = {
  CSE: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
  ],
  AI: ['A', 'B', 'C', 'D', 'E'],
  AIML: ['A', 'B', 'C', 'D', 'E', 'F'],
  IT: ['A', 'B', 'C', 'D'],
  DS: ['A', 'B'],
  CS: ['A', 'B'],
  ECE: ['A', 'B', 'C', 'D', 'E'],
}

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = window.localStorage.getItem(authStorageKey)
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (auth) {
      window.localStorage.setItem(authStorageKey, JSON.stringify(auth))
      return
    }

    window.localStorage.removeItem(authStorageKey)
  }, [auth])

  const handleAuthSuccess = (payload) => {
    setAuth(payload)
  }

  const handleLogout = () => {
    setAuth(null)
  }

  return (
    <main className="page-shell">
      <div className="ambient orb-one" aria-hidden="true"></div>
      <div className="ambient orb-two" aria-hidden="true"></div>

      <div className="page-content">
        <header className="topbar topbar-user">
          <div>
            <p className="tagline">Java Full Stack Student Portal</p>
            <h1 className="topbar-title">Project Submission Form Anurag_tt</h1>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<UserFormPage />} />
          <Route
            path="/faculty/login"
            element={
              auth ? (
                <Navigate to="/faculty/dashboard" replace />
              ) : (
                <FacultyAuthPage mode="login" onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/faculty/signup"
            element={
              auth ? (
                <Navigate to="/faculty/dashboard" replace />
              ) : (
                <FacultyAuthPage mode="signup" onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute auth={auth}>
                <FacultyDashboardPage auth={auth} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  )
}

function ProtectedRoute({ auth, children }) {
  if (!auth?.token) {
    return <Navigate to="/faculty/login" replace />
  }

  return children
}

function UserFormPage() {
  const [formData, setFormData] = useState(initialFormData)
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [isDraggingPdf, setIsDraggingPdf] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pdfInputRef = useRef(null)

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'department') {
      setFormData((prev) => ({ ...prev, department: value, section: '' }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const setValidPdf = (file) => {
    if (!file) {
      return
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setPdfError('Only PDF files are allowed.')
      return
    }

    setPdfError('')
    setPdfFile(file)
  }

  const handlePdfInputChange = (event) => {
    setValidPdf(event.target.files?.[0])
  }

  const handlePdfDrop = (event) => {
    event.preventDefault()
    setIsDraggingPdf(false)
    setValidPdf(event.dataTransfer.files?.[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSuccessMessage('')

    if (!pdfFile) {
      setPdfError('Please upload your prototype PDF before submitting.')
      return
    }

    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value))
    payload.append('prototypePdf', pdfFile)

    try {
      setIsSubmitting(true)
      await submitProject(payload)
      setFormData(initialFormData)
      setPdfFile(null)
      setPdfError('')
      if (pdfInputRef.current) {
        pdfInputRef.current.value = ''
      }
      setSuccessMessage('Your project details have been stored successfully in the database.')
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sections = formData.department ? departmentSections[formData.department] ?? [] : []

  return (
    <div className="route-grid user-form-only">
      <section className="form-card">
        <p className="tagline">User Side</p>
        <h2 className="section-title">Student Project Submission</h2>
        <p className="intro-text">
          This page is only for students. Fill and submit your project details.
        </p>

        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-split">
            <label>
              Name
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Roll No
              <input
                name="rollNo"
                type="text"
                value={formData.rollNo}
                onChange={handleChange}
                required
                placeholder="Enter your roll number"
              />
            </label>
          </div>

          <div className="form-split form-split-triple">
            <label>
              Year
              <select name="year" value={formData.year} onChange={handleChange} required>
                <option value="">Select year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>

            <label>
              Department
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select department</option>
                {Object.keys(departmentSections).map((departmentName) => (
                  <option key={departmentName} value={departmentName}>
                    {departmentName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Section
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                disabled={!formData.department}
              >
                <option value="">Select section</option>
                {sections.map((sectionName) => (
                  <option key={sectionName} value={sectionName}>
                    {sectionName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Project Title
            <input
              name="projectTitle"
              type="text"
              value={formData.projectTitle}
              onChange={handleChange}
              required
              placeholder="Enter your project title"
            />
          </label>

          <div className="form-split">
            <label>
              GitHub Link
              <input
                name="githubLink"
                type="url"
                value={formData.githubLink}
                onChange={handleChange}
                required
                placeholder="https://github.com/username/repo"
              />
            </label>

            <label>
              Live Link
              <input
                name="liveLink"
                type="url"
                value={formData.liveLink}
                onChange={handleChange}
                required
                placeholder="https://your-project-live-link.com"
              />
            </label>
          </div>

          <label>
            Prototype PDF
            <div
              className={`pdf-dropzone${isDraggingPdf ? ' is-dragging' : ''}`}
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDraggingPdf(true)
              }}
              onDragLeave={() => setIsDraggingPdf(false)}
              onDrop={handlePdfDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  pdfInputRef.current?.click()
                }
              }}
            >
              <input
                ref={pdfInputRef}
                className="pdf-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfInputChange}
              />
              <p className="drop-main">Drop your prototype PDF here</p>
              <p className="drop-sub">PDF only, or click to browse files</p>
              {pdfFile ? <p className="file-name">Selected: {pdfFile.name}</p> : null}
            </div>
            {pdfError ? <p className="field-error">{pdfError}</p> : null}
          </label>

          <button type="submit" className="submit-btn form-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </button>

          {successMessage ? <p className="success-text">{successMessage}</p> : null}
          {submitError ? <p className="field-error">{submitError}</p> : null}
        </form>
      </section>
    </div>
  )
}

function FacultyAuthPage({ mode, onAuthSuccess }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)
      const response = isSignup
        ? await facultySignup(formData)
        : await facultyLogin({ email: formData.email, password: formData.password })

      onAuthSuccess(response)
      navigate('/faculty/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <header className="topbar topbar-faculty">
        <div>
          <p className="tagline">Faculty Side</p>
          <h2 className="section-title">Faculty Access</h2>
        </div>
        <nav className="topbar-nav" aria-label="Faculty navigation">
          <NavLink to="/faculty/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Login
          </NavLink>
          <NavLink to="/faculty/signup" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Signup
          </NavLink>
        </nav>
      </header>

      <section className="auth-card">
        <p className="tagline">Faculty Access</p>
        <h2 className="section-title">{isSignup ? 'Create faculty account' : 'Faculty login'}</h2>
        <p className="intro-text">
          {isSignup
            ? 'Sign up once to manage student submissions from the protected dashboard.'
            : 'Use your faculty credentials to open the protected dashboard.'}
        </p>

        <form className="project-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <label>
              Faculty Name
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter faculty name"
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="faculty@college.edu"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>

          {error ? <p className="field-error">{error}</p> : null}
        </form>

        <div className="auth-switch-row">
          <span>{isSignup ? 'Already have an account?' : 'Need a faculty account?'}</span>
          <NavLink to={isSignup ? '/faculty/login' : '/faculty/signup'} className="text-link">
            {isSignup ? 'Login here' : 'Sign up here'}
          </NavLink>
        </div>
      </section>
    </div>
  )
}

function FacultyDashboardPage({ auth, onLogout }) {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    department: '',
    section: '',
  })
  const [exportFormat, setExportFormat] = useState('excel')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadSubmissions = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchSubmissions(auth.token, filters)
        if (isActive) {
          setSubmissions(response)
        }
      } catch (requestError) {
        if (requestError.status === 401 || requestError.status === 403) {
          onLogout()
          navigate('/faculty/login')
          return
        }

        if (isActive) {
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSubmissions()

    return () => {
      isActive = false
    }
  }, [auth.token, filters.search, filters.year, filters.department, filters.section, navigate, onLogout])

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    if (name === 'department') {
      setFilters((prev) => ({ ...prev, department: value, section: '' }))
      return
    }

    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleDelete = async (submissionId) => {
    try {
      await deleteSubmission(auth.token, submissionId)
      setSubmissions((prev) => prev.filter((submission) => submission.id !== submissionId))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleToggleStar = async (submissionId) => {
    try {
      const updated = await toggleSubmissionStar(auth.token, submissionId)
      setSubmissions((prev) =>
        prev
          .map((submission) => (submission.id === submissionId ? updated : submission))
          .sort((left, right) => {
            if (left.starred !== right.starred) {
              return Number(right.starred) - Number(left.starred)
            }

            return new Date(right.submittedAt) - new Date(left.submittedAt)
          }),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleViewProject = (liveLink) => {
    window.open(liveLink, '_blank', 'noopener,noreferrer')
  }

  const exportRecords = () => {
    if (submissions.length === 0) {
      return
    }

    const rows = submissions.map((record) => ({
      Name: record.name,
      'Roll No': record.rollNo,
      Year: record.year,
      Department: record.department,
      Section: record.section,
      'Project Title': record.projectTitle,
      'GitHub Link': record.githubLink,
      'Live Link': record.liveLink,
      'Prototype PDF': record.pdfName,
      Important: record.starred ? 'Yes' : 'No',
    }))

    if (exportFormat === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty Dashboard')
      XLSX.writeFile(workbook, 'faculty-dashboard.xlsx')
      return
    }

    const document = new jsPDF({ orientation: 'landscape' })
    document.setFontSize(16)
    document.text('Faculty Project Dashboard', 14, 16)
    autoTable(document, {
      startY: 24,
      head: [Object.keys(rows[0])],
      body: rows.map((row) => Object.values(row)),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [14, 47, 80] },
    })
    document.save('faculty-dashboard.pdf')
  }

  const filterSections = filters.department ? departmentSections[filters.department] ?? [] : []
  const starredCount = submissions.filter((submission) => submission.starred).length

  return (
    <section className="dashboard-card dashboard-page">
      <header className="topbar topbar-faculty dashboard-nav">
        <div>
          <p className="tagline">Faculty Side</p>
          <h2 className="section-title">Protected Faculty Dashboard</h2>
        </div>
        <nav className="topbar-nav" aria-label="Faculty actions">
          <div className="export-choice-row top-export-row">
            <button
              type="button"
              className={`secondary-btn export-choice-btn${exportFormat === 'excel' ? ' active' : ''}`}
              onClick={() => setExportFormat('excel')}
            >
              Export to Excel
            </button>
            <button
              type="button"
              className={`secondary-btn export-choice-btn${exportFormat === 'pdf' ? ' active' : ''}`}
              onClick={() => setExportFormat('pdf')}
            >
              Export to PDF
            </button>
          </div>
          <button type="button" className="nav-link nav-button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="dashboard-header">
        <div>
          <p className="tagline">Faculty Dashboard</p>
          <p className="intro-text dashboard-intro">
            Signed in as {auth.name}. Search, filter, star important submissions, open live projects, and export the current view.
          </p>
        </div>
        <div className="header-badge">{submissions.length} visible</div>
      </div>

      <div className="stats-grid">
        <article className="stat-tile">
          <span>Total Entries</span>
          <strong>{submissions.length}</strong>
        </article>
        <article className="stat-tile">
          <span>Important</span>
          <strong>{starredCount}</strong>
        </article>
        <article className="stat-tile">
          <span>Current Filter</span>
          <strong>{filters.department || 'All'}</strong>
        </article>
      </div>

      <div className="dashboard-toolbar dashboard-toolbar-split">
        <div className="toolbar-left">
          <input
            className="search-input"
            name="search"
            type="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, roll no, project, department"
          />
        </div>

        <div className="toolbar-right">
          <div className="filter-row">
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">All years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            <select name="department" value={filters.department} onChange={handleFilterChange}>
              <option value="">All departments</option>
              {Object.keys(departmentSections).map((departmentName) => (
                <option key={departmentName} value={departmentName}>
                  {departmentName}
                </option>
              ))}
            </select>

            <select
              name="section"
              value={filters.section}
              onChange={handleFilterChange}
              disabled={!filters.department}
            >
              <option value="">All sections</option>
              {filterSections.map((sectionName) => (
                <option key={sectionName} value={sectionName}>
                  {sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? <p className="field-error dashboard-error">{error}</p> : null}

      <div className="dashboard-list">
        {loading ? (
          <div className="empty-state">
            <h3>Loading submissions</h3>
            <p>The faculty dashboard is fetching project records from the database.</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <h3>No projects found</h3>
            <p>No submissions match the current filter yet.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table" aria-label="Student submissions table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Project Title</th>
                  <th>GitHub</th>
                  <th>Live Link</th>
                  <th>Prototype PDF</th>
                  <th>Submitted</th>
                  <th>View</th>
                  <th>Delete</th>
                  <th>Star</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.name}</td>
                    <td>{submission.rollNo}</td>
                    <td>{submission.year}</td>
                    <td>{submission.department}</td>
                    <td>{submission.section}</td>
                    <td className="project-title-cell">{submission.projectTitle}</td>
                    <td>
                      <a href={submission.githubLink} target="_blank" rel="noreferrer" className="table-link">
                        Open
                      </a>
                    </td>
                    <td>
                      <a href={submission.liveLink} target="_blank" rel="noreferrer" className="table-link">
                        Open
                      </a>
                    </td>
                    <td>{submission.pdfName || 'N/A'}</td>
                    <td>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button type="button" className="table-action-btn" onClick={() => handleViewProject(submission.liveLink)}>
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-action-btn delete-btn"
                        onClick={() => handleDelete(submission.id)}
                      >
                        Delete
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`star-btn table-star-btn${submission.starred ? ' active' : ''}`}
                        onClick={() => handleToggleStar(submission.id)}
                        aria-label={submission.starred ? 'Unmark important project' : 'Mark important project'}
                      >
                        ★
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-download-row">
        <button type="button" className="secondary-btn download-btn" onClick={exportRecords} disabled={submissions.length === 0}>
          Download
        </button>
      </div>
    </section>
  )
}

export default App
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { deleteSubmission, fetchSubmissions, toggleSubmissionStar } from '../api'
import departmentSections from '../data/departmentSections'
import '../styles/dashboard-page.css'

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

  const getLivePlatformLabel = (liveLink) => {
    if (!liveLink) {
      return 'Render'
    }

    try {
      const { hostname } = new URL(liveLink)
      const normalizedHost = hostname.toLowerCase()

      if (normalizedHost.includes('vercel.app') || normalizedHost.includes('vercel.com')) {
        return 'Vercel'
      }

      if (normalizedHost.includes('render.com')) {
        return 'Render'
      }

      return 'Render'
    } catch {
      return 'Render'
    }
  }

  const exportRecords = (format) => {
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

    if (format === 'excel') {
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
              onClick={() => {
                setExportFormat('excel')
                exportRecords('excel')
              }}
              disabled={submissions.length === 0}
            >
              Export to Excel
            </button>
            <button
              type="button"
              className={`secondary-btn export-choice-btn${exportFormat === 'pdf' ? ' active' : ''}`}
              onClick={() => {
                setExportFormat('pdf')
                exportRecords('pdf')
              }}
              disabled={submissions.length === 0}
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
                        GitHub
                      </a>
                    </td>
                    <td>
                      <a href={submission.liveLink} target="_blank" rel="noreferrer" className="table-link">
                        {getLivePlatformLabel(submission.liveLink)}
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
    </section>
  )
}

export default FacultyDashboardPage

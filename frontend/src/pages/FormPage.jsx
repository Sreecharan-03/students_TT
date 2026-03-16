import { useRef, useState } from 'react'
import { submitProject } from '../api'
import departmentSections from '../data/departmentSections'
import '../styles/form-page.css'

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

function FormPage() {
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

export default FormPage

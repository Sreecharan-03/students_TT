import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { facultySignup } from '../api'
import '../styles/auth-page.css'

function FacultySignupPage({ onAuthSuccess }) {
  const navigate = useNavigate()
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
      const response = await facultySignup(formData)
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
        <h2 className="section-title">Create faculty account</h2>
        <p className="intro-text">Sign up once to manage student submissions from the protected dashboard.</p>

        <form className="project-form" onSubmit={handleSubmit}>
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
            {isSubmitting ? 'Please wait...' : 'Create Account'}
          </button>

          {error ? <p className="field-error">{error}</p> : null}
        </form>

        <div className="auth-switch-row">
          <span>Already have an account?</span>
          <NavLink to="/faculty/login" className="text-link">
            Login here
          </NavLink>
        </div>
      </section>
    </div>
  )
}

export default FacultySignupPage

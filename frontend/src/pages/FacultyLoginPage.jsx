import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { facultyLogin } from '../api'
import '../styles/auth-page.css'

function FacultyLoginPage({ onAuthSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
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
      const response = await facultyLogin({ email: formData.email, password: formData.password })
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
        <h2 className="section-title">Faculty login</h2>
        <p className="intro-text">Use your faculty credentials to open the protected dashboard.</p>

        <form className="project-form" onSubmit={handleSubmit}>
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
            {isSubmitting ? 'Please wait...' : 'Login'}
          </button>

          {error ? <p className="field-error">{error}</p> : null}
        </form>

        <div className="auth-switch-row">
          <span>Need a faculty account?</span>
          <NavLink to="/faculty/signup" className="text-link">
            Sign up here
          </NavLink>
        </div>
      </section>
    </div>
  )
}

export default FacultyLoginPage

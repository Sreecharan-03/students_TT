import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import FacultyDashboardPage from './pages/FacultyDashboardPage'
import FacultyLoginPage from './pages/FacultyLoginPage'
import FacultySignupPage from './pages/FacultySignupPage'
import FormPage from './pages/FormPage'
import './styles/common.css'
import './styles/shell.css'

const authStorageKey = 'anurag_tt_faculty_auth'

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
            <h1 className="topbar-title">Project Submission Form Anurag_tt</h1>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route
            path="/faculty/login"
            element={
              auth ? (
                <Navigate to="/faculty/dashboard" replace />
              ) : (
                <FacultyLoginPage onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/faculty/signup"
            element={
              auth ? (
                <Navigate to="/faculty/dashboard" replace />
              ) : (
                <FacultySignupPage onAuthSuccess={handleAuthSuccess} />
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

export default App
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
const fallbackBaseUrls = [
  configuredBaseUrl,
  'http://localhost:8081/api',
  'http://127.0.0.1:8081/api',
  'http://localhost:8080/api',
]

async function apiRequest(path, options = {}) {
  const uniqueBaseUrls = [...new Set(fallbackBaseUrls)]
  let lastNetworkError = null

  for (let index = 0; index < uniqueBaseUrls.length; index += 1) {
    const baseUrl = uniqueBaseUrls[index]
    const headers = new Headers(options.headers || {})
    const isFormData = options.body instanceof FormData
    let body = options.body

    if (body && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body,
      })

      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

      if (!response.ok) {
        const message = typeof payload === 'string' && payload
          ? payload
          : payload?.message || 'Request failed.'
        const error = new Error(message)
        error.status = response.status
        throw error
      }

      return payload
    } catch (error) {
      // Retry only network-level failures across fallback URLs.
      if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
        lastNetworkError = error
        const hasNext = index < uniqueBaseUrls.length - 1
        if (hasNext) {
          continue
        }
      }

      throw error
    }
  }

  if (lastNetworkError) {
    throw lastNetworkError
  }

  throw new Error('Request failed.')
}

function withAuth(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export function submitProject(formData) {
  return apiRequest('/public/submissions', {
    method: 'POST',
    body: formData,
  })
}

export function facultySignup(payload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: payload,
  })
}

export function facultyLogin(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function fetchSubmissions(token, filters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()
  return apiRequest(`/faculty/submissions${query ? `?${query}` : ''}`, {
    headers: withAuth(token),
  })
}

export function toggleSubmissionStar(token, submissionId) {
  return apiRequest(`/faculty/submissions/${submissionId}/star`, {
    method: 'PATCH',
    headers: withAuth(token),
  })
}

export function deleteSubmission(token, submissionId) {
  return apiRequest(`/faculty/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: withAuth(token),
  })
}
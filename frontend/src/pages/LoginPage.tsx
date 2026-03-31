import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginDummyJson } from '../api/dummyjson'
import { setSession } from '../auth/storage'
import { ErrorBanner } from '../components/ErrorBanner'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [username, setUsername] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await loginDummyJson(username.trim(), password)
      setSession(r.accessToken, r.username)
      navigate(from === '/login' ? '/' : from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>JaneQ</h1>
      <p className="muted">Sign in with DummyJSON credentials (demo: emilys / emilyspass).</p>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <form className="card" onSubmit={onSubmit}>
        <label>
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="muted small">
        Auth via{' '}
        <a href="https://dummyjson.com/docs/auth" target="_blank" rel="noreferrer">
          dummyjson.com
        </a>
      </p>
    </div>
  )
}

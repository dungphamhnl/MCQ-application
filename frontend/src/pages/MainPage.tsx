import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchHistory, fetchTypes } from '../api/janeq'
import type { HistoryAttempt } from '../api/janeq'
import { clearSession, getUsername } from '../auth/storage'
import { ErrorBanner } from '../components/ErrorBanner'

export function MainPage() {
  const navigate = useNavigate()
  const [types, setTypes] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryAttempt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const t = await fetchTypes()
        if (!cancelled) setTypes(t)
        try {
          const h = await fetchHistory()
          if (!cancelled) setHistory(h)
        } catch {
          if (!cancelled) setHistory([])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load types')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <header className="top-bar">
        <h1>JaneQ — MCQ</h1>
        <div className="top-actions">
          <span className="muted">{getUsername()}</span>
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <p className="lead">Choose a question category from JaneQ.</p>
      {loading ? (
        <p className="muted">Loading types…</p>
      ) : (
        <ul className="type-grid">
          {types.map((t) => (
            <li key={t}>
              <Link className="type-card" to={`/quiz/${encodeURIComponent(t)}`}>
                {t}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {history.length > 0 ? (
        <section className="history-section">
          <h2 className="history-title">Past attempts</h2>
          <ul className="history-list">
            {history.map((a) => (
              <li key={a.file} className="history-row">
                <span className="history-meta">
                  {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : a.file}
                </span>
                <span>
                  {a.username} — {a.mcqType}: {a.score}/{a.total}
                </span>
                <code className="history-path">{a.exportPath}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

import { Link, useLocation, Navigate } from 'react-router-dom'
import type { SubmitResponse } from '../api/types'

type LocState = {
  result: SubmitResponse
  mcqType: string
  username: string
}

export function ResultsPage() {
  const location = useLocation()
  const state = location.state as LocState | null

  if (!state?.result) {
    return <Navigate to="/" replace />
  }

  const { result, mcqType, username } = state
  const pct = result.total ? Math.round((100 * result.score) / result.total) : 0

  return (
    <div className="page">
      <h1>Results</h1>
      <p className="lead">
        <strong>{username}</strong> — {mcqType}
      </p>
      <p className="score-line">
        Score: <strong>{result.score}</strong> / {result.total} ({pct}%)
      </p>
      <p className="muted small">
        Export saved in repo: <code>{result.exportPath}</code>
      </p>
      <ul className="results-list">
        {result.items.map((it) => (
          <li key={it.questionId} className={it.correct ? 'item ok' : 'item bad'}>
            <p className="q">{it.question}</p>
            <p className="muted small">
              Your answer: {it.selected ?? '(none)'}
              {!it.correct ? (
                <>
                  {' '}
                  — correct: <strong>{it.correctAnswer}</strong>
                </>
              ) : null}
            </p>
            {it.explanation ? <p className="explain">{it.explanation}</p> : null}
          </li>
        ))}
      </ul>
      <Link className="button-link" to="/">
        Another category
      </Link>
    </div>
  )
}

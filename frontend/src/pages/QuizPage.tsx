import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuestions, submitAnswers } from '../api/janeq'
import type { QuestionPublic } from '../api/types'
import { getUsername } from '../auth/storage'
import { ErrorBanner } from '../components/ErrorBanner'

const SECONDS_PER_QUESTION = 60

export function QuizPage() {
  const { typeEnc } = useParams<{ typeEnc: string }>()
  const mcqType = typeEnc ? decodeURIComponent(typeEnc) : ''
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<QuestionPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION)

  const current = questions[index]
  const selected = current ? answers[current.id] : undefined
  const isLast = index >= questions.length - 1

  useEffect(() => {
    if (!mcqType) return
    let cancelled = false
    ;(async () => {
      try {
        const q = await fetchQuestions(mcqType)
        if (!cancelled) setQuestions(q)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load questions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mcqType])

  // Countdown per question (resets when index changes)
  useEffect(() => {
    if (!current) return
    setSecondsLeft(SECONDS_PER_QUESTION)
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [index, current?.id])

  const pickOption = useCallback((qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }, [])

  const goNext = useCallback(() => {
    if (!selected) return
    if (isLast) return
    setIndex((i) => i + 1)
  }, [selected, isLast])

  async function finish() {
    if (!selected || submitting) return
    const user = getUsername()
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id] ?? null,
      }))
      const result = await submitAnswers(user, mcqType, payload)
      navigate('/results', { state: { result, mcqType, username: user } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mcqType) {
    return (
      <div className="page">
        <p>Invalid category.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading questions…</p>
      </div>
    )
  }

  if (error && !questions.length) {
    return (
      <div className="page">
        <ErrorBanner message={error} />
        <Link to="/">Back to categories</Link>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="page">
        <p>No questions.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  const timerWarn = secondsLeft <= 10

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Categories</Link>
        <span aria-hidden="true"> / </span>
        <span>{mcqType}</span>
      </nav>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <div className="quiz-meta">
        <span className="muted">
          Question {index + 1} of {questions.length}
        </span>
        <span className={timerWarn ? 'timer warn' : 'timer'} aria-live="polite">
          {secondsLeft}s
        </span>
      </div>
      <article className="card question-card">
        <h2>{current.question}</h2>
        <ul className="options">
          {current.options.map((opt) => {
            const id = `opt-${current.id}-${opt.slice(0, 20)}`
            return (
              <li key={opt}>
                <label htmlFor={id} className={answers[current.id] === opt ? 'option picked' : 'option'}>
                  <input
                    id={id}
                    type="radio"
                    name={`q-${current.id}`}
                    checked={answers[current.id] === opt}
                    onChange={() => pickOption(current.id, opt)}
                  />
                  <span>{opt}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </article>
      <div className="quiz-actions">
        <button type="button" className="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Previous
        </button>
        {isLast ? (
          <button type="button" onClick={finish} disabled={!selected || submitting}>
            {submitting ? 'Submitting…' : 'Submit & see score'}
          </button>
        ) : (
          <button type="button" onClick={goNext} disabled={!selected}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}

import { JANEQ_BASE } from '../config'
import type { QuestionPublic, SubmitResponse, TypesResponse } from './types'

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Invalid JSON from JaneQ')
  }
  if (!res.ok) {
    const detail =
      typeof data === 'object' && data !== null && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : res.statusText
    throw new Error(detail || `Request failed (${res.status})`)
  }
  return data as T
}

export async function fetchTypes(): Promise<string[]> {
  const res = await fetch(`${JANEQ_BASE}/api/types`)
  const data = await parseJson<TypesResponse>(res)
  return data.types
}

export async function fetchQuestions(mcqType: string): Promise<QuestionPublic[]> {
  const params = new URLSearchParams({ type: mcqType })
  const res = await fetch(`${JANEQ_BASE}/api/questions?${params.toString()}`)
  return parseJson<QuestionPublic[]>(res)
}

export type AnswerPayload = { questionId: number; selected: string | null }

export type HistoryAttempt = {
  file: string
  exportPath: string
  submittedAt: string
  username: string
  mcqType: string
  score: number
  total: number
}

export async function fetchHistory(): Promise<HistoryAttempt[]> {
  const res = await fetch(`${JANEQ_BASE}/api/history`)
  const data = await parseJson<{ attempts: HistoryAttempt[] }>(res)
  return data.attempts
}

export async function submitAnswers(
  username: string,
  mcqType: string,
  answers: AnswerPayload[],
): Promise<SubmitResponse> {
  const res = await fetch(`${JANEQ_BASE}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      mcqType,
      answers,
    }),
  })
  return parseJson<SubmitResponse>(res)
}

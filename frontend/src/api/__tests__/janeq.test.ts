/**
 * RED Phase: Frontend API tests — written to define expected behavior.
 * These tests mock fetch so they run without a live server.
 * Run with: cd frontend && npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

function mockFetch(json: unknown, ok = true, status = 200) {
  return vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(json)),
    }),
  ) as ReturnType<typeof fetch>
}

// ---------------------------------------------------------------------------
// Imports (dynamically so tests are isolated)
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// fetchTypes
// ---------------------------------------------------------------------------

describe('fetchTypes', async () => {
  const { fetchTypes } = await import('../janeq')

  it('returns string array on 200', async () => {
    global.fetch = mockFetch({ types: ['JavaScript / React.js', 'API / HTTP'] })
    const result = await fetchTypes()
    expect(result).toEqual(['JavaScript / React.js', 'API / HTTP'])
  })

  it('throws on non-200 with detail', async () => {
    global.fetch = mockFetch({ detail: 'Not found' }, false, 404)
    await expect(fetchTypes()).rejects.toThrow('Not found')
  })

  it('throws on non-200 without detail', async () => {
    global.fetch = mockFetch('Internal Server Error', false, 500)
    await expect(fetchTypes()).rejects.toThrow('Request failed (500)')
  })

  it('throws on invalid JSON', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('not json'),
      }),
    ) as ReturnType<typeof fetch>
    await expect(fetchTypes()).rejects.toThrow('Invalid JSON from JaneQ')
  })
})

// ---------------------------------------------------------------------------
// fetchQuestions
// ---------------------------------------------------------------------------

describe('fetchQuestions', async () => {
  const { fetchQuestions } = await import('../janeq')

  it('returns question array on 200', async () => {
    const mockQuestions = [
      { id: 0, question: 'What is 2+2?', options: ['3', '4', '5'] },
    ]
    global.fetch = mockFetch(mockQuestions)
    const result = await fetchQuestions('math')
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('question')
    expect(result[0]).toHaveProperty('options')
    expect(result[0]).not.toHaveProperty('answer')
    expect(result[0]).not.toHaveProperty('explanation')
  })

  it('calls /api/questions with type param', async () => {
    global.fetch = mockFetch([])
    await fetchQuestions('Python / Django / FastAPI')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/questions'),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('type=Python'),
    )
  })

  it('throws on non-200', async () => {
    global.fetch = mockFetch({ detail: 'Unknown or empty MCQ type' }, false, 404)
    await expect(fetchQuestions('nonexistent')).rejects.toThrow('Unknown or empty MCQ type')
  })
})

// ---------------------------------------------------------------------------
// submitAnswers
// ---------------------------------------------------------------------------

describe('submitAnswers', async () => {
  const { submitAnswers } = await import('../janeq')

  it('returns SubmitResponse on 201', async () => {
    const mockResponse = {
      score: 3,
      total: 5,
      items: [
        {
          questionId: 0,
          question: 'What is 2+2?',
          selected: '4',
          correct: true,
          correctAnswer: '4',
          explanation: 'Basic math',
        },
      ],
      exportPath: 'exports/submission_test_123.json',
    }
    global.fetch = mockFetch(mockResponse, true, 201)
    const result = await submitAnswers('testuser', 'math', [
      { questionId: 0, selected: '4' },
    ])
    expect(result.score).toBe(3)
    expect(result.total).toBe(5)
    expect(result.exportPath).toBe('exports/submission_test_123.json')
  })

  it('calls POST /api/submit with correct body', async () => {
    global.fetch = mockFetch({ score: 0, total: 0, items: [], exportPath: '' }, true, 201)
    const answers = [{ questionId: 0, selected: '3' }]
    await submitAnswers('testuser', 'math', answers)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/submit'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws on 404 (unknown type)', async () => {
    global.fetch = mockFetch({ detail: 'No questions for type' }, false, 404)
    await expect(submitAnswers('testuser', 'nonexistent', [])).rejects.toThrow(
      'No questions for type',
    )
  })

  it('throws on 400 (bad questionId)', async () => {
    global.fetch = mockFetch({ detail: 'Question id 9999 is not in type' }, false, 400)
    await expect(submitAnswers('testuser', 'math', [{ questionId: 9999, selected: 'x' }])).rejects.toThrow(
      'Question id 9999 is not in type',
    )
  })

  it('throws on 422 (validation error)', async () => {
    global.fetch = mockFetch({ detail: 'Field required' }, false, 422)
    await expect(submitAnswers('', 'math', [])).rejects.toThrow('Field required')
  })
})

// ---------------------------------------------------------------------------
// fetchHistory
// ---------------------------------------------------------------------------

describe('fetchHistory', async () => {
  const { fetchHistory } = await import('../janeq')

  it('returns HistoryAttempt array on 200', async () => {
    const mockAttempts = [
      {
        file: 'submission_test.json',
        exportPath: 'exports/submission_test.json',
        submittedAt: '2026-03-31T08:00:00Z',
        username: 'testuser',
        mcqType: 'math',
        score: 3,
        total: 5,
      },
    ]
    global.fetch = mockFetch({ attempts: mockAttempts })
    const result = await fetchHistory()
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('username')
    expect(result[0]).toHaveProperty('mcqType')
    expect(result[0]).toHaveProperty('score')
    expect(result[0]).toHaveProperty('total')
  })

  it('returns empty array when no attempts', async () => {
    global.fetch = mockFetch({ attempts: [] })
    const result = await fetchHistory()
    expect(result).toHaveLength(0)
  })

  it('calls GET /api/history', async () => {
    global.fetch = mockFetch({ attempts: [] })
    await fetchHistory()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/history'),
    )
  })
})

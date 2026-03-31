export type QuestionPublic = {
  id: number
  question: string
  options: string[]
}

export type ResultItem = {
  questionId: number
  question: string
  selected: string | null
  correct: boolean
  correctAnswer: string
  explanation?: string
}

export type SubmitResponse = {
  score: number
  total: number
  items: ResultItem[]
  exportPath: string
}

export type TypesResponse = {
  types: string[]
}

import { DUMMYJSON_AUTH } from '../config'

export type LoginResult = {
  accessToken: string
  username: string
}

export async function loginDummyJson(
  username: string,
  password: string,
): Promise<LoginResult> {
  const res = await fetch(DUMMYJSON_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = (await res.json()) as {
    accessToken?: string
    username?: string
    message?: string
  }
  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }
  if (!data.accessToken || !data.username) {
    throw new Error('Unexpected login response')
  }
  return { accessToken: data.accessToken, username: data.username }
}

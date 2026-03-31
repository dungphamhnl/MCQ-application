const TOKEN_KEY = 'janeq_access_token'
const USER_KEY = 'janeq_username'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername(): string | null {
  return localStorage.getItem(USER_KEY)
}

export function setSession(token: string, username: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, username)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

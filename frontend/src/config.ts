/** JaneQ API base (no trailing slash). */
export const JANEQ_BASE =
  import.meta.env.VITE_JANEQ_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

/** DummyJSON auth endpoint. */
export const DUMMYJSON_AUTH = 'https://dummyjson.com/auth/login'

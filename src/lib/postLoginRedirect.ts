export function savePostLoginRedirect(path?: string) {
  if (typeof window === 'undefined') return
  const p = path ?? (window.location.pathname + window.location.search + window.location.hash)
  sessionStorage.setItem('postLoginRedirect', p)
}
import { createContext, useContext, useState, useEffect } from 'react'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('rr_token'))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tok = params.get('token'), usr = params.get('user')
    if (tok && usr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(usr))
        localStorage.setItem('rr_token', tok); setToken(tok); setUser(parsed)
        window.history.replaceState({}, '', '/'); setLoading(false); return
      } catch {}
    }
    if (params.get('verified')) window.history.replaceState({}, '', '/?justverified=1')
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json()).then(d => { if (d.user) setUser(d.user); else logout(); })
        .catch(() => logout()).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])
  const login = (tok, usr) => { localStorage.setItem('rr_token', tok); setToken(tok); setUser(usr) }
  const logout = () => { localStorage.removeItem('rr_token'); setToken(null); setUser(null) }
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: 'Bearer ' + token } })
    if (res.status === 401) { logout(); return null }
    return res
  }
  return <AuthContext.Provider value={{ user, token, login, logout, authFetch, loading }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)

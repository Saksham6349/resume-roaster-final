import { useState } from 'react'

export default function ResetPasswordView({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const token = new URLSearchParams(window.location.search).get('token')

  const handleReset = async () => {
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(data.message)
      setTimeout(() => { window.history.replaceState({},'',' /'); onDone() }, 2000)
    } catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:52,height:52,background:'var(--accent)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 16px'}}>🔥</div>
          <h1 style={{fontSize:26,fontWeight:800,marginBottom:6}}>Reset Password</h1>
          <p style={{color:'var(--muted)',fontSize:14}}>Enter your new password below.</p>
        </div>
        <div className="card" style={{padding:'28px'}}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleReset()} />
          </div>
          <button className="btn-primary" onClick={handleReset} disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {!token && <div className="error-box">Invalid reset link.</div>}
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success} Redirecting...</div>}
        </div>
      </div>
    </div>
  )
}

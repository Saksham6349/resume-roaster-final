import { useEffect, useState } from 'react'

export default function AuthView() {
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'google') setError('Google login failed. Please try again.')
  }, [])

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:380,textAlign:'center'}}>
        <div style={{width:64,height:64,background:'var(--accent)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px'}}>🔥</div>
        <h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.8px',marginBottom:8}}>Resume Roaster</h1>
        <p style={{color:'var(--muted)',fontSize:15,marginBottom:40}}>AI-powered ATS analysis with <span style={{color:'var(--accent)',fontWeight:700}}>brutally honest feedback</span></p>

        <div className="card" style={{padding:'32px 28px'}}>
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Sign in to analyze your resume, track history, and compare versions.</p>
          <a href="/api/auth/google" style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:12,
            width:'100%',padding:'15px',background:'white',border:'none',borderRadius:12,
            color:'#1f1f1f',fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,
            cursor:'pointer',textDecoration:'none',transition:'all 0.15s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Continue with Google
          </a>
          {error && <div className="error-box" style={{marginTop:16}}>{error}</div>}
        </div>

        <p style={{color:'var(--dim)',fontSize:12,marginTop:24}}>
          Your data is private and tied to your Google account.
        </p>
      </div>
    </div>
  )
}

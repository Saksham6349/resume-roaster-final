import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthView from './views/AuthView'
import ResetPasswordView from './views/ResetPasswordView'
import UploadView from './views/UploadView'
import ResultsView from './views/ResultsView'
import HistoryView from './views/HistoryView'
import CompareView from './views/CompareView'

function AppInner() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('upload')
  const [results, setResults] = useState(null)

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner"/>
    </div>
  )

  // Password reset page
  if (new URLSearchParams(window.location.search).get('token') && window.location.pathname !== '/') {
    return <ResetPasswordView onDone={() => window.history.replaceState({}, '', '/')} />
  }
  if (window.location.search.includes('token=') && !window.location.search.includes('rr_token')) {
    const params = new URLSearchParams(window.location.search)
    if (!params.get('user')) {
      return <ResetPasswordView onDone={() => window.history.replaceState({}, '', '/')} />
    }
  }

  if (!user) return <AuthView />

  const setViewSafe = (v) => { if (v !== 'results') setResults(null); setView(v) }

  return (
    <div>
      <Navbar view={view==='results'?'upload':view} setView={setViewSafe}/>
      <div className="container">
        {view==='upload' && <UploadView onResults={r=>{setResults(r);setView('results')}}/>}
        {view==='results' && results && <ResultsView results={results} onBack={()=>{setResults(null);setView('upload')}}/>}
        {view==='history' && <HistoryView onSelect={r=>{setResults(r);setView('results')}}/>}
        {view==='compare' && <CompareView/>}
      </div>
      <footer style={{borderTop:'1px solid var(--border)',padding:'24px 0',textAlign:'center',color:'var(--dim)',fontSize:12}}>
        Resume Roaster v4 · React + JWT Auth + Google OAuth + Llama 3.3 70B · VIT Vellore
      </footer>
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppInner/></AuthProvider>
}

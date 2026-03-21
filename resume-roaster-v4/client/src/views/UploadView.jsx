import { useState } from 'react'
import DropZone from '../components/DropZone'
import { useAuth } from '../context/AuthContext'
import { SkeletonResults } from '../components/Skeleton'

const MSGS = ['Reading your resume...','Step 1: Extracting structure...','Step 2: Deep ATS analysis...','Step 3: JD matching...','Finalizing results...']

export default function UploadView({ onResults }) {
  const { authFetch } = useAuth()
  const [tab, setTab] = useState('pdf')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [jd, setJd] = useState('')
  const [showJD, setShowJD] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState(MSGS[0])
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (tab==='pdf'&&!file) { setError('Please upload a PDF.'); return }
    if (tab==='text'&&!text.trim()) { setError('Please paste your resume text.'); return }
    setLoading(true); let i=0; setLoadMsg(MSGS[0])
    const interval = setInterval(()=>{ i=Math.min(i+1,MSGS.length-1); setLoadMsg(MSGS[i]) }, 2500)
    try {
      let res
      if (tab==='pdf') {
        const fd=new FormData(); fd.append('resume',file); if(jd.trim()) fd.append('jd',jd)
        res = await authFetch('/api/roast',{method:'POST',body:fd})
      } else {
        res = await authFetch('/api/roast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,jd})})
      }
      if (!res) return
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onResults(data)
    } catch(err){ setError(err.message); setLoading(false) }
    finally{ clearInterval(interval) }
  }

  if (loading) return (
    <div style={{paddingTop:36}}>
      <div style={{marginBottom:28,display:'flex',alignItems:'center',gap:12}}>
        <div className="spinner" style={{width:24,height:24,margin:0}}/>
        <div>
          <p style={{fontWeight:700,fontSize:14}}>{loadMsg}</p>
          <p style={{color:'var(--dim)',fontSize:12,marginTop:3}}>3-step AI pipeline · takes ~10s</p>
        </div>
      </div>
      <SkeletonResults />
    </div>
  )

  return (
    <div style={{paddingTop:44,paddingBottom:80}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:34,fontWeight:800,letterSpacing:'-1px',marginBottom:8}}>Roast My Resume</h1>
        <p style={{color:'var(--muted)',fontSize:14}}>AI-powered ATS analysis with <span style={{color:'var(--accent)',fontWeight:700}}>brutally honest feedback</span></p>
      </div>
      <div className="tabs">
        {['pdf','text'].map(t=>(
          <button key={t} className={'tab-btn'+(tab===t?' active':'')} onClick={()=>setTab(t)}>
            {t==='pdf'?'Upload PDF':'Paste Text'}
          </button>
        ))}
      </div>
      {tab==='pdf' ? <DropZone file={file} onFile={setFile}/> : <textarea style={{height:200}} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your full resume here..."/>}
      <button onClick={()=>setShowJD(!showJD)} style={{background:'transparent',border:'none',color:showJD?'var(--accent)':'var(--muted)',fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:14,padding:'4px 0',display:'flex',alignItems:'center',gap:6}}>
        {showJD?'▾':'▸'} {showJD?'Hide':'+ Add'} Job Description for role-specific matching
      </button>
      {showJD && <textarea style={{height:130,marginTop:10}} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the job description here..."/>}
      <button className="btn-primary" style={{marginTop:18}} onClick={handleSubmit}>🔥 Roast My Resume</button>
      {error && <div className="error-box">{error}</div>}
    </div>
  )
}

import { useState } from 'react'
import DropZone from '../components/DropZone'
import { useAuth } from '../context/AuthContext'
const col=s=>s>=75?'#4db87a':s>=50?'#f0b03a':'#e05252'
export default function CompareView() {
  const { authFetch } = useAuth()
  const [tabs,setTabs]=useState(['pdf','pdf'])
  const [files,setFiles]=useState([null,null])
  const [texts,setTexts]=useState(['',''])
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const setFile=(i,f)=>setFiles(p=>{const n=[...p];n[i]=f;return n})
  const setText=(i,t)=>setTexts(p=>{const n=[...p];n[i]=t;return n})
  const setTab=(i,t)=>setTabs(p=>{const n=[...p];n[i]=t;return n})
  const handleCompare=async()=>{
    setError('')
    for(let i=0;i<2;i++){
      if(tabs[i]==='pdf'&&!files[i]){setError('Please upload Resume '+(i+1));return}
      if(tabs[i]==='text'&&!texts[i].trim()){setError('Please paste Resume '+(i+1));return}
    }
    setLoading(true)
    try{
      const fd=new FormData()
      if(tabs[0]==='pdf')fd.append('resume1',files[0]);else fd.append('text1',texts[0])
      if(tabs[1]==='pdf')fd.append('resume2',files[1]);else fd.append('text2',texts[1])
      const res=await authFetch('/api/compare',{method:'POST',body:fd})
      if(!res)return
      const data=await res.json()
      if(!res.ok)throw new Error(data.error)
      setResult(data)
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  if(loading)return <div className="loading" style={{paddingTop:100}}><div className="spinner"/><p style={{color:'var(--muted)',fontSize:15}}>Comparing resumes...</p></div>
  return (
    <div style={{paddingTop:44,paddingBottom:80}}>
      <div style={{marginBottom:32}}><h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.8px',marginBottom:8}}>Compare Resumes</h1><p style={{color:'var(--muted)',fontSize:14}}>Upload two versions — AI picks a winner and explains why.</p></div>
      {!result?(
        <>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            {[0,1].map(i=>(
              <div key={i}>
                <p className="section-label">Resume {i+1}</p>
                <div className="tabs" style={{marginBottom:12}}>{['pdf','text'].map(t=><button key={t} className={'tab-btn'+(tabs[i]===t?' active':'')} onClick={()=>setTab(i,t)} style={{padding:'8px 14px',fontSize:12}}>{t==='pdf'?'PDF':'Text'}</button>)}</div>
                {tabs[i]==='pdf'?<DropZone file={files[i]} onFile={f=>setFile(i,f)} label={'Resume '+(i+1)}/>:<textarea style={{height:160}} value={texts[i]} onChange={e=>setText(i,e.target.value)} placeholder={'Paste Resume '+(i+1)+'...'}/>}
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={handleCompare}>⚡ Compare Resumes</button>
          {error&&<div className="error-box">{error}</div>}
        </>
      ):(
        <div>
          <div className="card" style={{textAlign:'center',padding:'32px 24px',marginBottom:24,borderRadius:16}}>
            <p className="section-label">Verdict</p>
            <p style={{fontSize:34,fontWeight:800,color:result.winner==='tie'?'var(--amber)':'var(--green)',marginBottom:12}}>🏆 {result.winner==='tie'?'Tie':'Resume '+(result.winner==='resume1'?'1':'2')+' Wins'}</p>
            <p style={{fontSize:14,color:'#ccc8be',lineHeight:1.65,maxWidth:500,margin:'0 auto'}}>{result.verdict}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
            {['resume1','resume2'].map((key)=>{
              const r=result[key],isW=result.winner===key
              return(
                <div key={key} className="card" style={{borderColor:isW?'rgba(77,184,122,0.4)':'var(--border)'}}>
                  {isW&&<p style={{fontSize:11,fontWeight:700,color:'var(--green)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>✓ Winner</p>}
                  <p style={{fontWeight:800,fontSize:15,marginBottom:4}}>{r.name}</p>
                  <p style={{fontSize:32,fontWeight:800,color:col(r.ats_score),marginBottom:16}}>{r.ats_score}</p>
                  <p style={{fontSize:11,fontWeight:700,color:'var(--green)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Strengths</p>
                  {r.strengths.map((s,i)=><p key={i} style={{fontSize:12,color:'#bfbbb3',lineHeight:1.5,marginBottom:5}}>· {s}</p>)}
                  <p style={{fontSize:11,fontWeight:700,color:'var(--red)',letterSpacing:1.5,textTransform:'uppercase',margin:'14px 0 8px'}}>Weaknesses</p>
                  {r.weaknesses.map((w,i)=><p key={i} style={{fontSize:12,color:'#bfbbb3',lineHeight:1.5,marginBottom:5}}>· {w}</p>)}
                </div>
              )
            })}
          </div>
          {result.tips?.length>0&&<div className="card" style={{marginBottom:32}}><p style={{fontSize:11,fontWeight:700,color:'var(--accent)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>How to Improve</p>{result.tips.map((t,i)=><div key={i} style={{display:'flex',gap:10,marginBottom:10}}><span style={{color:'var(--accent)',fontWeight:800,flexShrink:0}}>{i+1}.</span><p style={{fontSize:13,color:'#bfbbb3',lineHeight:1.6}}>{t}</p></div>)}</div>}
          <div style={{textAlign:'center'}}><button className="btn-ghost" onClick={()=>setResult(null)}>← Compare Again</button></div>
        </div>
      )}
    </div>
  )
}

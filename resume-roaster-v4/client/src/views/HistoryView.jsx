import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { SkeletonHistory } from '../components/Skeleton'
const col=s=>s>=75?'#4db87a':s>=50?'#f0b03a':'#e05252'
export default function HistoryView({ onSelect }) {
  const { authFetch } = useAuth()
  const [items, setItems] = useState([])
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    authFetch('/api/history').then(r=>r&&r.json()).then(d=>{if(d){setAvailable(d.available);setItems(d.items||[])}}).finally(()=>setLoading(false))
  }, [])
  const del = async (id,e) => {
    e.stopPropagation()
    await authFetch('/api/history/'+id,{method:'DELETE'})
    setItems(p=>p.filter(i=>i._id!==id))
  }
  return (
    <div style={{paddingTop:44,paddingBottom:80}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.8px',marginBottom:8}}>Your History</h1>
        <p style={{color:'var(--muted)',fontSize:14}}>{available?'All your past analyses, tied to your account.':'Add MONGODB_URI to .env to enable history.'}</p>
      </div>
      {loading ? <SkeletonHistory /> : (
        <>
          {!available&&<div style={{background:'rgba(240,176,58,0.07)',border:'1px solid rgba(240,176,58,0.2)',borderRadius:12,padding:'20px 24px'}}><p style={{fontWeight:700,color:'var(--amber)',marginBottom:8}}>MongoDB not connected</p><p style={{fontSize:13,color:'var(--muted)'}}>Get free DB at mongodb.com/atlas → add MONGODB_URI to .env</p></div>}
          {available&&items.length===0&&<div style={{textAlign:'center',paddingTop:60,color:'var(--muted)'}}><div style={{fontSize:40,marginBottom:14}}>📭</div><p style={{fontWeight:700}}>No analyses yet</p><p style={{fontSize:13,marginTop:6}}>Roast your first resume to see history here</p></div>}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {items.map(item=>(
              <div key={item._id} className="card" onClick={()=>onSelect(item)} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:16,transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{width:52,height:52,borderRadius:10,background:'var(--s2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:col(item.ats_score),flexShrink:0}}>{item.ats_score}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:700,fontSize:14,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.filename}</p>
                  <p style={{fontSize:12,color:'var(--muted)'}}>
                    {new Date(item.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                    {item.jd_match&&<span style={{marginLeft:10,color:'var(--accent)'}}>· JD {item.jd_match.score}%</span>}
                  </p>
                </div>
                <button onClick={e=>del(item._id,e)} style={{background:'transparent',border:'none',color:'var(--dim)',cursor:'pointer',fontSize:18,padding:4}}>×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const CAT={contact_info:'Contact Info',work_experience:'Work Experience',skills:'Skills',education:'Education',keywords:'ATS Keywords',formatting:'Formatting'}
const col=s=>s>=75?'#4db87a':s>=50?'#f0b03a':'#e05252'
const verdict=s=>s>=85?{text:'Strong Candidate',bg:'rgba(77,184,122,0.12)',color:'#4db87a'}:s>=70?{text:'Decent — Polish It',bg:'rgba(240,176,58,0.12)',color:'#f0b03a'}:s>=50?{text:'Needs Work',bg:'rgba(232,98,42,0.12)',color:'#e8622a'}:{text:'Back to Drawing Board',bg:'rgba(224,82,82,0.12)',color:'#e05252'}

export default function ResultsView({ results, onBack }) {
  const v=verdict(results.ats_score)
  return (
    <div style={{paddingTop:36,paddingBottom:80}}>
      <div className="card" style={{textAlign:'center',padding:'44px 40px',marginBottom:24,borderRadius:18}}>
        <p className="section-label">ATS Score</p>
        <div style={{fontSize:96,fontWeight:800,lineHeight:1,letterSpacing:'-3px',marginBottom:14,color:col(results.ats_score)}}>{results.ats_score}</div>
        <span style={{background:v.bg,color:v.color,fontSize:13,fontWeight:700,padding:'6px 18px',borderRadius:20,display:'inline-block'}}>{v.text}</span>
      </div>
      {results.ai_steps?.extracted&&(
        <div className="card" style={{marginBottom:24,background:'var(--s2)'}}>
          <p className="section-label" style={{marginBottom:12}}>AI Extracted Profile</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[['Name',results.ai_steps.extracted.name],['Experience',(results.ai_steps.extracted.experience_years||0)+' yrs'],['Word Count',results.ai_steps.extracted.word_count],['Quantified Impact',results.ai_steps.extracted.has_quantified_impact?'✓ Yes':'✗ No']].map(([l,v])=>(
              <div key={l} style={{background:'var(--s1)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:12}}>
                <span style={{color:'var(--muted)'}}>{l}: </span>
                <span style={{fontWeight:700,color:l==='Quantified Impact'?(String(v).includes('✓')?'#4db87a':'#e05252'):'var(--text)'}}>{v}</span>
              </div>
            ))}
          </div>
          {results.ai_steps.extracted.skills?.length>0&&(
            <div style={{marginTop:12}}>
              <span style={{fontSize:12,color:'var(--muted)'}}>Skills: </span>
              {results.ai_steps.extracted.skills.slice(0,8).map((s,i)=>(
                <span key={i} style={{display:'inline-block',background:'var(--s3)',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:6,margin:'2px'}}>{s}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {results.jd_match&&(
        <div style={{background:'rgba(232,98,42,0.06)',border:'1px solid rgba(232,98,42,0.2)',borderRadius:14,padding:'24px 26px',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'var(--accent)'}}>JD Match Score</p>
            <span style={{fontSize:32,fontWeight:800,color:col(results.jd_match.score)}}>{results.jd_match.score}%</span>
          </div>
          <div className="progress-bar" style={{marginBottom:14}}><div className="progress-fill" style={{width:`${results.jd_match.score}%`,background:col(results.jd_match.score)}}/></div>
          <p style={{fontSize:13,color:'#ccc8be',lineHeight:1.65,marginBottom:16}}>{results.jd_match.verdict}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[['Matched','matched_keywords','var(--green)','rgba(77,184,122,0.1)'],['Missing','missing_keywords','var(--red)','rgba(224,82,82,0.1)']].map(([t,k,c,bg])=>(
              <div key={k}>
                <p style={{fontSize:11,fontWeight:700,color:c,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>{t}</p>
                {results.jd_match[k].map((kw,i)=><span key={i} style={{display:'inline-block',background:bg,color:c,fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:6,margin:'0 4px 6px 0'}}>{kw}</span>)}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="section-label">Score Breakdown</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:24}}>
        {Object.entries(results.categories).map(([key,val])=>(
          <div key={key} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--muted)'}}>{CAT[key]}</span>
              <span style={{fontSize:24,fontWeight:800,color:col(val.score)}}>{val.score}</span>
            </div>
            <div className="progress-bar" style={{marginBottom:10}}><div className="progress-fill" style={{width:`${val.score}%`,background:col(val.score)}}/></div>
            <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.55}}>{val.comment}</p>
          </div>
        ))}
      </div>
      <div style={{background:'rgba(232,98,42,0.07)',border:'1px solid rgba(232,98,42,0.22)',borderRadius:14,padding:'26px 28px',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <span style={{fontSize:18}}>🎤</span>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',color:'var(--accent)'}}>The Roast</span>
        </div>
        <p style={{fontFamily:'Space Mono,monospace',fontSize:13,lineHeight:1.85,color:'#ccc8be',fontStyle:'italic'}}>{results.roast}</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:36}}>
        {[['⚡ What to Fix',results.fixes,'var(--red)','rgba(224,82,82,0.1)',true],["✓ What's Working",results.strengths,'var(--green)','rgba(77,184,122,0.1)',false]].map(([title,items,color,bg,numbered])=>(
          <div key={title} className="card">
            <p style={{fontSize:13,fontWeight:800,color,marginBottom:16}}>{title}</p>
            {items.map((item,i)=>(
              <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                <span style={{flexShrink:0,width:20,height:20,borderRadius:'50%',background:bg,color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,marginTop:1}}>{numbered?i+1:'✓'}</span>
                <span style={{fontSize:13,color:'#bfbbb3',lineHeight:1.55}}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{textAlign:'center'}}><button className="btn-ghost" onClick={onBack}>← Analyze Another Resume</button></div>
    </div>
  )
}

import { useAuth } from '../context/AuthContext'

export default function Navbar({ view, setView }) {
  const { user, logout } = useAuth()
  const navItems = [
    { id:'upload', label:'🔥 Analyze' },
    { id:'compare', label:'⚡ Compare' },
    { id:'history', label:'📊 History' },
  ]
  return (
    <nav style={{borderBottom:'1px solid var(--border)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:60,position:'sticky',top:0,background:'rgba(10,10,9,0.95)',backdropFilter:'blur(8px)',zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:30,height:30,background:'var(--accent)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔥</div>
        <span style={{fontWeight:800,fontSize:17,letterSpacing:'-0.3px'}}>Resume Roaster</span>
      </div>
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setView(item.id)} style={{background:view===item.id?'var(--s2)':'transparent',border:'1px solid '+(view===item.id?'var(--border)':'transparent'),borderRadius:8,color:view===item.id?'var(--text)':'var(--muted)',padding:'7px 14px',fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
            {item.label}
          </button>
        ))}
        <div style={{width:1,height:20,background:'var(--border)',margin:'0 8px'}}/>
        {user?.avatar && <img src={user.avatar} style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}} alt="" />}
        <span style={{fontSize:13,color:'var(--muted)',marginRight:4}}>{user?.name?.split(' ')[0]}</span>
        <button onClick={logout} style={{background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',padding:'7px 14px',fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          Logout
        </button>
      </div>
    </nav>
  )
}

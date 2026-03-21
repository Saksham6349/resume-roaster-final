import { useState, useRef } from 'react'
export default function DropZone({ file, onFile, label='Resume' }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type==='application/pdf') onFile(f)
  }
  if (file) return (
    <div className="file-badge">
      <span>✓</span><span>{file.name}</span>
      <button onClick={()=>onFile(null)} style={{marginLeft:'auto',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18}}>×</button>
    </div>
  )
  return (
    <div className={`drop-zone${dragging?' drag-over':''}`}
      onClick={()=>inputRef.current.click()}
      onDragOver={e=>{e.preventDefault();setDragging(true)}}
      onDragLeave={()=>setDragging(false)}
      onDrop={handleDrop}>
      <div style={{fontSize:32,marginBottom:10}}>📄</div>
      <p style={{fontWeight:700,marginBottom:5}}>Drop {label} PDF here</p>
      <p style={{color:'var(--muted)',fontSize:13}}>or click to browse</p>
      <input ref={inputRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e=>onFile(e.target.files[0])} />
    </div>
  )
}

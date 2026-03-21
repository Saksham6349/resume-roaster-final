export function SkeletonCard({ height = 120 }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 28, width: 44, borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 3, width: '100%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 11, width: '75%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 11, width: '55%' }} />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '44px 40px', marginBottom: 24, borderRadius: 18 }}>
      <div className="skeleton" style={{ height: 12, width: 80, margin: '0 auto 16px' }} />
      <div className="skeleton" style={{ height: 90, width: 140, margin: '0 auto 16px', borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 30, width: 160, margin: '0 auto', borderRadius: 20 }} />
    </div>
  )
}

export function SkeletonResults() {
  return (
    <div style={{ paddingTop: 36 }}>
      <SkeletonHero />
      <div className="skeleton" style={{ height: 11, width: 120, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="card" style={{ padding: '26px 28px', marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 12, width: 100, marginBottom: 16 }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 11, width: i === 2 ? '60%' : '90%', marginBottom: 10 }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonHistory() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px' }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 13, width: '50%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 11, width: '35%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

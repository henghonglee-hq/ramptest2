import React from 'react'
import { listActivity } from '@/lib/api'

export function ActivityPage(): JSX.Element {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Awaited<ReturnType<typeof listActivity>>>([])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    listActivity()
      .then(data => { if (!cancelled) setItems(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      {loading && 'Loading...'}
      {!loading && items.length === 0 && 'No activity yet.'}
      {!loading && items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(it => (
            <li key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{it.type}</div>
                <div style={{ color: '#475569', fontSize: 12 }}>{new Date(it.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ color: it.status === 'completed' ? '#16a34a' : it.status === 'failed' ? '#dc2626' : '#0ea5e9' }}>{it.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


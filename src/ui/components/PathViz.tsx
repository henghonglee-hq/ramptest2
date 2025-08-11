import React from 'react'

export interface PathStep {
  kind: 'ramp' | 'swap'
  providerName: string
  feePercent: number
  fixedFeeAmount: number
  fixedFeeCurrency: string
}

export function PathViz({ steps }: { steps: PathStep[] }): JSX.Element | null {
  if (steps.length === 0) return null
  return (
    <div style={{ marginTop: 16, border: '1px dashed #cbd5e1', borderRadius: 12, padding: 12, background: '#f8fafc' }}>
      <div style={{ fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>Path</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <_StepPill
              title={
                step.kind === 'ramp'
                  ? idx === 0
                    ? 'On Ramp'
                    : idx === steps.length - 1
                      ? 'Off Ramp'
                      : 'Ramp'
                  : 'Swap'
              }
              provider={step.providerName}
              fee={`${step.feePercent.toFixed(2)}% + ${step.fixedFeeAmount.toFixed(2)} ${step.fixedFeeCurrency}`}
            />
            {idx < steps.length - 1 && <_Arrow />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function _StepPill({ title, provider, fee }: { title: string; provider: string; fee: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 999 }}>
      <span style={{ fontWeight: 900, color: '#0f172a' }}>{title}</span>
      <span style={{ color: '#64748b' }}>•</span>
      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{provider}</span>
      <span style={{ color: '#64748b' }}>•</span>
      <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 700 }}>{fee}</span>
    </div>
  )
}

function _Arrow(): JSX.Element {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 12h14m0 0l-4-4m4 4l-4 4" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


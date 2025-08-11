import React from 'react'
import { Tabs } from '@/ui/components/Tabs'

type Tab = 'convert' | 'activity' | 'routing'

interface NavigationProps {
  value: Tab
  onChange: (tab: Tab) => void
}

const TAB_ITEMS: { key: Tab; label: string }[] = [
  { key: 'convert', label: 'Swap' },
  { key: 'routing', label: 'Routing' },
  { key: 'activity', label: 'Activity' },
]

export function Navigation({ value, onChange }: NavigationProps): JSX.Element {
  return (
    <Tabs tabs={TAB_ITEMS} value={value} onChange={onChange} ariaLabel="Main navigation" />
  )
}


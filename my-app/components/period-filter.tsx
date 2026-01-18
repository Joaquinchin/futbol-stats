'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export type Period = '1w' | '2w' | '1m' | '3m' | '6m' | '1y' | 'all'

interface PeriodFilterProps {
  value: Period
  onChange: (period: Period) => void
}

const periods: { value: Period; label: string }[] = [
  { value: '1w', label: '1 Semana' },
  { value: '2w', label: '2 Semanas' },
  { value: '1m', label: '1 Mes' },
  { value: '3m', label: '3 Meses' },
  { value: '6m', label: '6 Meses' },
  { value: '1y', label: '1 Año' },
  { value: 'all', label: 'Todo' },
]

export function getPeriodLabel(period: Period): string {
  const found = periods.find(p => p.value === period)
  return found ? found.label : 'Todo'
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1 flex-wrap">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={value === period.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function filterMatchesByPeriod<T extends { match_date: string }>(
  matches: T[],
  period: Period
): T[] {
  if (period === 'all') return matches

  const now = new Date()
  let startDate: Date

  switch (period) {
    case '1w':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '2w':
      startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      break
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      break
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      break
    case '1y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
    default:
      return matches
  }

  return matches.filter((match) => new Date(match.match_date) >= startDate)
}

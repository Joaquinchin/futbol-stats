'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { createClient } from '@/lib/client'
import type { Tournament } from '@/lib/types'
import type { Period } from '@/components/period-filter'

interface FiltersCardProps {
  period: Period
  onPeriodChange: (period: Period) => void
  tournamentId: string | null
  onTournamentChange: (tournamentId: string | null) => void
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

export function FiltersCard({ period, onPeriodChange, tournamentId, onTournamentChange }: FiltersCardProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setTournaments(data)
    }
  }

  const handleClearFilters = () => {
    onPeriodChange('all')
    onTournamentChange(null)
  }

  const hasActiveFilters = period !== 'all' || tournamentId !== null

  return (
    <Card className="relative">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3 items-end">
          {/* Fecha */}
          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Fecha</span>
            <Select
              value={period}
              onValueChange={(value: Period) => onPeriodChange(value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Torneo */}
          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Torneo</span>
            <Select
              value={tournamentId || 'all'}
              onValueChange={(value) => onTournamentChange(value === 'all' ? null : value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los torneos</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón limpiar */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              className="h-9 w-9 shrink-0"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


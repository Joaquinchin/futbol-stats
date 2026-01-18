'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trophy, X } from 'lucide-react'
import { createClient } from '@/lib/client'
import type { Tournament } from '@/lib/types'

interface TournamentFilterProps {
  value: string | null
  onChange: (tournamentId: string | null) => void
}

export function TournamentFilter({ value, onChange }: TournamentFilterProps) {
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

  if (tournaments.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Trophy className="h-4 w-4 text-muted-foreground" />
      <Select value={value || 'all'} onValueChange={(val) => onChange(val === 'all' ? null : val)}>
        <SelectTrigger className="w-[200px] h-8 text-xs">
          <SelectValue placeholder="Todos los torneos" />
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
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => onChange(null)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}


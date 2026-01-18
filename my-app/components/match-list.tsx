'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Trophy, Target, Users, Pencil } from 'lucide-react'
import { EditMatchForm } from '@/components/edit-match-form'
import type { Match, MatchType } from '@/lib/types'

interface MatchListProps {
  matches: Match[]
  onMatchUpdated: () => void
}

const matchTypeLabels: Record<MatchType, string> = {
  amistoso: 'Amistoso',
  torneo: 'Torneo',
  liga: 'Liga',
  copa: 'Copa',
  entrenamiento: 'Entrenamiento',
}

const matchTypeVariants: Record<MatchType, 'default' | 'secondary' | 'outline'> = {
  amistoso: 'secondary',
  torneo: 'default',
  liga: 'default',
  copa: 'default',
  entrenamiento: 'outline',
}

export function MatchList({ matches, onMatchUpdated }: MatchListProps) {
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)

  const getResult = (match: Match): 'win' | 'loss' | 'draw' => {
    const myScore = match.my_team === 'team_a' ? match.score_a : match.score_b
    const theirScore = match.my_team === 'team_a' ? match.score_b : match.score_a
    if (myScore > theirScore) return 'win'
    if (myScore < theirScore) return 'loss'
    return 'draw'
  }

  const resultColors = {
    win: 'bg-primary/10 border-primary/20',
    loss: 'bg-destructive/10 border-destructive/20',
    draw: 'bg-muted border-muted-foreground/20',
  }

  const resultLabels = {
    win: 'Victoria',
    loss: 'Derrota',
    draw: 'Empate',
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            No hay partidos registrados todavia.
            <br />
            <span className="text-sm">Agrega tu primer partido para comenzar!</span>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ultimos Partidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4 pt-0">
              {matches.map((match) => {
                const result = getResult(match)
                const myTeam = match.my_team === 'team_a' ? match.team_a : match.team_b
                const opponent = match.my_team === 'team_a' ? match.team_b : match.team_a

                return (
                  <div
                    key={match.id}
                    className={`rounded-lg border p-3 ${resultColors[result]} group relative`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setEditingMatch(match)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Editar partido</span>
                    </Button>
                    <div className="flex items-start justify-between gap-2 pr-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={matchTypeVariants[match.match_type]}>
                            {matchTypeLabels[match.match_type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(match.match_date).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{myTeam}</span>
                          <span className="text-lg font-bold">
                            {match.score_a} - {match.score_b}
                          </span>
                          <span className="truncate text-muted-foreground">{opponent}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`
                          ${result === 'win' ? 'border-primary text-primary' : ''}
                          ${result === 'loss' ? 'border-destructive text-destructive' : ''}
                        `}>
                          {resultLabels[result]}
                        </Badge>
                      </div>
                    </div>
                    {(match.my_goals > 0 || match.my_assists > 0) && (
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {match.my_goals > 0 && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{match.my_goals}</span>
                            <span className="text-muted-foreground">gol{match.my_goals !== 1 && 'es'}</span>
                          </span>
                        )}
                        {match.my_assists > 0 && (
                          <span className="flex items-center gap-1 text-accent-foreground">
                            <span className="font-medium">{match.my_assists}</span>
                            <span className="text-muted-foreground">asist{match.my_assists !== 1 ? 'encias' : 'encia'}</span>
                          </span>
                        )}
                      </div>
                    )}
                    {match.notes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {match.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {editingMatch && (
        <EditMatchForm
          match={editingMatch}
          open={!!editingMatch}
          onOpenChange={(open) => !open && setEditingMatch(null)}
          onSuccess={onMatchUpdated}
        />
      )}
    </>
  )
}

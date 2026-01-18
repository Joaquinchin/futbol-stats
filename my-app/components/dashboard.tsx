'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Target, Trophy, Users, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/stats-card'
import { MatchForm } from '@/components/match-form'
import { MatchList } from '@/components/match-list'
import { GoalsChart } from '@/components/goals-chart'
import { ResultsChart } from '@/components/results-chart'
import { TeamsManager } from '@/components/teams-manager'
import { TournamentsManager } from '@/components/tournaments-manager'
import { FiltersCard } from '@/components/filters-card'
import { filterMatchesByPeriod, type Period } from '@/components/period-filter'
import { createClient } from '@/lib/client'
import type { Match, MatchStats, MonthlyStats } from '@/lib/types'

const fetcher = async (): Promise<Match[]> => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })

    if (error) return []
    return data || []
  } catch (err) {
    return []
  }
}

function calculateStats(matches: Match[]): MatchStats {
  const totalMatches = matches.length
  const totalGoals = matches.reduce((sum, m) => sum + m.my_goals, 0)
  const totalAssists = matches.reduce((sum, m) => sum + m.my_assists, 0)

  let wins = 0
  let draws = 0
  let losses = 0

  matches.forEach((match) => {
    const myScore = match.my_team === 'team_a' ? match.score_a : match.score_b
    const theirScore = match.my_team === 'team_a' ? match.score_b : match.score_a
    if (myScore > theirScore) wins++
    else if (myScore < theirScore) losses++
    else draws++
  })

  return {
    totalMatches,
    totalGoals,
    totalAssists,
    wins,
    draws,
    losses,
    goalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
    winRate: totalMatches > 0 ? (wins / totalMatches) * 100 : 0,
  }
}

function calculateMonthlyStats(matches: Match[]): MonthlyStats[] {
  const monthlyData: Record<string, { goals: number; assists: number; matches: number }> = {}

  matches.forEach((match) => {
    const date = new Date(match.match_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { goals: 0, assists: 0, matches: 0 }
    }
    monthlyData[monthKey].goals += match.my_goals
    monthlyData[monthKey].assists += match.my_assists
    monthlyData[monthKey].matches += 1
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        month: date.toLocaleDateString('es-AR', { month: 'short' }),
        ...monthlyData[key],
      }
    })
}

export function Dashboard() {
  const [period, setPeriod] = useState<Period>('all')
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null)
  const { data: allMatches = [], mutate, isLoading } = useSWR<Match[]>('matches', fetcher)
  
  // Filter by period first, then by tournament
  let filteredMatches = filterMatchesByPeriod(allMatches, period)
  if (selectedTournament) {
    filteredMatches = filteredMatches.filter(m => m.tournament_id === selectedTournament)
  }
  const matches = filteredMatches
  const stats = calculateStats(matches)
  const monthlyStats = calculateMonthlyStats(matches)

  const handleSuccess = useCallback(() => {
    mutate()
  }, [mutate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">FutbolStats</h1>
          <p className="text-muted-foreground">Tu registro personal de partidos</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TeamsManager />
          <TournamentsManager />
          <MatchForm onSuccess={handleSuccess} />
        </div>
      </div>

      <FiltersCard
        period={period}
        onPeriodChange={setPeriod}
        tournamentId={selectedTournament}
        onTournamentChange={setSelectedTournament}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatsCard
          title="Partidos Jugados"
          value={stats.totalMatches}
          icon={Users}
        />
        <StatsCard
          title="Goles Totales"
          value={stats.totalGoals}
          subtitle={`${stats.goalsPerMatch.toFixed(2)} por partido`}
          icon={Target}
          trend="up"
        />
        <StatsCard
          title="Asistencias"
          value={stats.totalAssists}
          icon={TrendingUp}
        />
        <StatsCard
          title="Victorias"
          value={stats.wins}
          subtitle={`${stats.winRate.toFixed(0)}% efectividad`}
          icon={Trophy}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GoalsChart data={monthlyStats} period={period} />
        <ResultsChart 
          wins={stats.wins} 
          draws={stats.draws} 
          losses={stats.losses} 
        />
      </div>

      <MatchList matches={matches} onMatchUpdated={handleSuccess} />
    </div>
  )
}

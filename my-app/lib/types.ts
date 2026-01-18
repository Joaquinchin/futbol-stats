export type MatchType = 'amistoso' | 'torneo' | 'liga' | 'copa' | 'entrenamiento'

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string
}

export interface Match {
  id: string
  match_date: string
  match_type: MatchType
  team_a: string
  team_b: string
  score_a: number
  score_b: number
  my_goals: number
  my_assists: number
  my_team: 'team_a' | 'team_b'
  duration_minutes: number | null
  notes: string | null
  tournament_id: string | null
  created_at: string
}

export interface MatchStats {
  totalMatches: number
  totalGoals: number
  totalAssists: number
  wins: number
  draws: number
  losses: number
  goalsPerMatch: number
  winRate: number
}

export interface MonthlyStats {
  month: string
  goals: number
  assists: number
  matches: number
}

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Plus, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import type { MatchType, Team, Tournament } from '@/lib/types'
import { createClient } from '@/lib/client'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

interface MatchFormProps {
  onSuccess: () => void
}

export function MatchForm({ onSuccess }: MatchFormProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teamAOpen, setTeamAOpen] = useState(false)
  const [teamBOpen, setTeamBOpen] = useState(false)
  const [newTeamA, setNewTeamA] = useState('')
  const [newTeamB, setNewTeamB] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    match_type: 'amistoso' as MatchType,
    team_a: '',
    team_b: '',
    score_a: 0,
    score_b: 0,
    goals_scored: 0,
    assists: 0,
    played_for: 'team_a' as 'team_a' | 'team_b',
    minutes_played: 90,
    notes: '',
    tournament_id: null as string | null,
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  // Get my team's total goals
  const myTeamGoals = formData.played_for === 'team_a' ? formData.score_a : formData.score_b
  
  // Max assists = team goals - my goals (can't assist your own goals)
  const maxAssists = Math.max(0, myTeamGoals - formData.goals_scored)
  
  // Max goals I can score is my team's total goals
  const maxGoals = myTeamGoals

  useEffect(() => {
    if (open) {
      loadTeams()
      loadTournaments()
    }
  }, [open])

  const loadTeams = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })
    if (data) setTeams(data)
  }

  const loadTournaments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTournaments(data)
  }

  const saveTeamIfNew = async (teamName: string) => {
    if (!teamName.trim() || !user) return teamName
    const supabase = createClient()
    const exists = teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())
    if (!exists) {
      const { data } = await supabase
        .from('teams')
        .insert([{ name: teamName.trim(), user_id: user.id }])
        .select()
        .single()
      if (data) {
        setTeams(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    return teamName.trim()
  }

  // Validate goals and assists
  const validateStats = () => {
    if (formData.goals_scored > myTeamGoals) {
      return `Tus goles (${formData.goals_scored}) no pueden ser mayor que los goles de tu equipo (${myTeamGoals})`
    }
    if (formData.assists > maxAssists) {
      return `Tus asistencias (${formData.assists}) no pueden ser mayor a ${maxAssists} (goles del equipo menos tus goles)`
    }
    if (formData.goals_scored + formData.assists > myTeamGoals) {
      return `La suma de tus goles y asistencias no puede superar los goles de tu equipo (${myTeamGoals})`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const error = validateStats()
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Save new teams if needed
      const teamA = await saveTeamIfNew(formData.team_a)
      const teamB = await saveTeamIfNew(formData.team_b)
      
      if (!user) return

      const { error } = await supabase.from('matches').insert([{
        match_date: formData.date,
        match_type: formData.match_type,
        team_a: teamA,
        team_b: teamB,
        score_a: formData.score_a,
        score_b: formData.score_b,
        my_goals: formData.goals_scored,
        my_assists: formData.assists,
        my_team: formData.played_for,
        duration_minutes: formData.minutes_played,
        notes: formData.notes || null,
        tournament_id: formData.tournament_id,
        user_id: user.id,
      }])

      if (error) throw error

      setOpen(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        match_type: 'amistoso',
        team_a: '',
        team_b: '',
        score_a: 0,
        score_b: 0,
        goals_scored: 0,
        assists: 0,
        played_for: 'team_a',
        minutes_played: 90,
        notes: '',
        tournament_id: null,
      })
      setNewTeamA('')
      setNewTeamB('')
      onSuccess()
    } catch (error) {
      console.error('Error saving match:', error)
    } finally {
      setLoading(false)
    }
  }

  const TeamCombobox = ({
    value,
    onChange,
    open: isOpen,
    onOpenChange,
    newTeam,
    onNewTeamChange,
    placeholder,
    id,
  }: {
    value: string
    onChange: (value: string) => void
    open: boolean
    onOpenChange: (open: boolean) => void
    newTeam: string
    onNewTeamChange: (value: string) => void
    placeholder: string
    id: string
  }) => {
    const filteredTeams = teams.filter(team => 
      team.name.toLowerCase().includes(newTeam.toLowerCase())
    )
    const showAddNew = newTeam.trim() && !teams.some(t => t.name.toLowerCase() === newTeam.toLowerCase())

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between bg-transparent"
            id={id}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar o agregar equipo..."
              value={newTeam}
              onValueChange={onNewTeamChange}
            />
            <CommandList>
              <CommandEmpty>
                {newTeam.trim() ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded"
                    onClick={() => {
                      onChange(newTeam.trim())
                      onNewTeamChange('')
                      onOpenChange(false)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar "{newTeam.trim()}"
                  </button>
                ) : (
                  'No hay equipos guardados'
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredTeams.map((team) => (
                  <CommandItem
                    key={team.id}
                    value={team.name}
                    onSelect={() => {
                      onChange(team.name)
                      onNewTeamChange('')
                      onOpenChange(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === team.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {team.name}
                  </CommandItem>
                ))}
                {showAddNew && filteredTeams.length > 0 && (
                  <CommandItem
                    onSelect={() => {
                      onChange(newTeam.trim())
                      onNewTeamChange('')
                      onOpenChange(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar "{newTeam.trim()}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Partido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Partido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="match_type">Tipo de Partido</Label>
              <Select
                value={formData.match_type}
                onValueChange={(value: MatchType) => setFormData({ ...formData, match_type: value })}
              >
                <SelectTrigger id="match_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amistoso">Amistoso</SelectItem>
                  <SelectItem value="torneo">Torneo</SelectItem>
                  <SelectItem value="liga">Liga</SelectItem>
                  <SelectItem value="copa">Copa</SelectItem>
                  <SelectItem value="entrenamiento">Entrenamiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tournaments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="tournament">Torneo (opcional)</Label>
              <Select
                value={formData.tournament_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, tournament_id: value === 'none' ? null : value })}
              >
                <SelectTrigger id="tournament">
                  <SelectValue placeholder="Sin torneo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin torneo</SelectItem>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team_a">Equipo A</Label>
              <TeamCombobox
                value={formData.team_a}
                onChange={(value) => setFormData({ ...formData, team_a: value })}
                open={teamAOpen}
                onOpenChange={setTeamAOpen}
                newTeam={newTeamA}
                onNewTeamChange={setNewTeamA}
                placeholder="Seleccionar equipo..."
                id="team_a"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_b">Equipo B</Label>
              <TeamCombobox
                value={formData.team_b}
                onChange={(value) => setFormData({ ...formData, team_b: value })}
                open={teamBOpen}
                onOpenChange={setTeamBOpen}
                newTeam={newTeamB}
                onNewTeamChange={setNewTeamB}
                placeholder="Seleccionar equipo..."
                id="team_b"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="score_a">Goles Equipo A</Label>
              <Input
                id="score_a"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="[appearance:textfield]"
                value={formData.score_a}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, score_a: val ? parseInt(val) : 0 })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score_b">Goles Equipo B</Label>
              <Input
                id="score_b"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="[appearance:textfield]"
                value={formData.score_b}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, score_b: val ? parseInt(val) : 0 })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="played_for">Jugaste en</Label>
              <Select
                value={formData.played_for}
                onValueChange={(value: 'team_a' | 'team_b') => setFormData({ ...formData, played_for: value })}
              >
                <SelectTrigger id="played_for">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_a">Equipo A</SelectItem>
                  <SelectItem value="team_b">Equipo B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goals_scored">
                Tus Goles
                <span className="text-muted-foreground text-xs ml-1">(max: {maxGoals})</span>
              </Label>
              <Input
                id="goals_scored"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={cn("[appearance:textfield]", formData.goals_scored > maxGoals && "border-destructive")}
                value={formData.goals_scored}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, goals_scored: val ? parseInt(val) : 0 })
                  setValidationError(null)
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assists">
                Tus Asistencias
                <span className="text-muted-foreground text-xs ml-1">(max: {maxAssists})</span>
              </Label>
              <Input
                id="assists"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={cn("[appearance:textfield]", formData.assists > maxAssists && "border-destructive")}
                value={formData.assists}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, assists: val ? parseInt(val) : 0 })
                  setValidationError(null)
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes_played">Minutos Jugados</Label>
              <Input
                id="minutes_played"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="[appearance:textfield]"
                value={formData.minutes_played}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, minutes_played: val ? parseInt(val) : 0 })
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones del partido, jugadas destacadas, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {validationError && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{validationError}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Partido
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

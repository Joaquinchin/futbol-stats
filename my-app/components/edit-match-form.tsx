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
import { Loader2, Check, ChevronsUpDown, Plus } from 'lucide-react'
import type { Match, MatchType, Team } from '@/lib/types'
import { createClient } from '@/lib/client'
import { cn } from '@/lib/utils'

interface EditMatchFormProps {
  match: Match
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditMatchForm({ match, open, onOpenChange, onSuccess }: EditMatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamAOpen, setTeamAOpen] = useState(false)
  const [teamBOpen, setTeamBOpen] = useState(false)
  const [newTeamA, setNewTeamA] = useState('')
  const [newTeamB, setNewTeamB] = useState('')
  const [formData, setFormData] = useState({
    date: match.match_date,
    match_type: match.match_type,
    team_a: match.team_a,
    team_b: match.team_b,
    score_a: match.score_a,
    score_b: match.score_b,
    goals_scored: match.my_goals,
    assists: match.my_assists,
    played_for: match.my_team,
    minutes_played: match.duration_minutes || 90,
    notes: match.notes || '',
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
      setFormData({
        date: match.match_date,
        match_type: match.match_type,
        team_a: match.team_a,
        team_b: match.team_b,
        score_a: match.score_a,
        score_b: match.score_b,
        goals_scored: match.my_goals,
        assists: match.my_assists,
        played_for: match.my_team,
        minutes_played: match.duration_minutes || 90,
        notes: match.notes || '',
      })
    }
  }, [open, match])

  const loadTeams = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })
    if (data) setTeams(data)
  }

  const saveTeamIfNew = async (teamName: string) => {
    if (!teamName.trim()) return teamName
    const supabase = createClient()
    const exists = teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())
    if (!exists) {
      const { data } = await supabase
        .from('teams')
        .insert([{ name: teamName.trim() }])
        .select()
        .single()
      if (data) {
        setTeams(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    return teamName.trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const teamA = await saveTeamIfNew(formData.team_a)
      const teamB = await saveTeamIfNew(formData.team_b)
      
      const { error } = await supabase
        .from('matches')
        .update({
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
        })
        .eq('id', match.id)

      if (error) throw error

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating match:', error)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Partido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-match_type">Tipo de Partido</Label>
              <Select
                value={formData.match_type}
                onValueChange={(value: MatchType) => setFormData({ ...formData, match_type: value })}
              >
                <SelectTrigger id="edit-match_type">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-team_a">Equipo A</Label>
              <TeamCombobox
                value={formData.team_a}
                onChange={(value) => setFormData({ ...formData, team_a: value })}
                open={teamAOpen}
                onOpenChange={setTeamAOpen}
                newTeam={newTeamA}
                onNewTeamChange={setNewTeamA}
                placeholder="Seleccionar equipo..."
                id="edit-team_a"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team_b">Equipo B</Label>
              <TeamCombobox
                value={formData.team_b}
                onChange={(value) => setFormData({ ...formData, team_b: value })}
                open={teamBOpen}
                onOpenChange={setTeamBOpen}
                newTeam={newTeamB}
                onNewTeamChange={setNewTeamB}
                placeholder="Seleccionar equipo..."
                id="edit-team_b"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-score_a">Goles Equipo A</Label>
              <Input
                id="edit-score_a"
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
              <Label htmlFor="edit-score_b">Goles Equipo B</Label>
              <Input
                id="edit-score_b"
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
              <Label htmlFor="edit-played_for">Jugaste en</Label>
              <Select
                value={formData.played_for}
                onValueChange={(value: 'team_a' | 'team_b') => setFormData({ ...formData, played_for: value })}
              >
                <SelectTrigger id="edit-played_for">
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
              <Label htmlFor="edit-goals_scored">Tus Goles</Label>
              <Input
                id="edit-goals_scored"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="[appearance:textfield]"
                value={formData.goals_scored}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, goals_scored: val ? parseInt(val) : 0 })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-assists">Tus Asistencias</Label>
              <Input
                id="edit-assists"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="[appearance:textfield]"
                value={formData.assists}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, assists: val ? parseInt(val) : 0 })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minutes_played">Minutos Jugados</Label>
              <Input
                id="edit-minutes_played"
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
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea
              id="edit-notes"
              placeholder="Observaciones del partido, jugadas destacadas, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

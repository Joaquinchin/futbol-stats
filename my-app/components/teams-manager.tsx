'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useAuth } from '@/components/auth-provider'
import type { Team } from '@/lib/types'

export function TeamsManager() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchTeams = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })
    
    setTeams(data || [])
  }

  useEffect(() => {
    if (open) {
      fetchTeams()
    }
  }, [open])

  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !user) return
    
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('teams')
        .insert([{ name: newTeamName.trim(), user_id: user.id }])
      
      if (!error) {
        setNewTeamName('')
        fetchTeams()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (id: string) => {
    const supabase = createClient()
    await supabase.from('teams').delete().eq('id', id)
    fetchTeams()
  }

  const handleStartEdit = (team: Team) => {
    setEditingId(team.id)
    setEditingName(team.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return
    const supabase = createClient()
    await supabase
      .from('teams')
      .update({ name: editingName.trim() })
      .eq('id', editingId)
    setEditingId(null)
    setEditingName('')
    fetchTeams()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Users className="h-4 w-4" />
          Equipos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administrar Equipos
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del equipo..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTeam()
                }
              }}
            />
            <Button onClick={handleAddTeam} disabled={isLoading || !newTeamName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Equipos guardados ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {teams.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No hay equipos guardados.
                    <br />
                    Agrega uno arriba o al cargar un partido.
                  </div>
                ) : (
                  <div className="space-y-1 p-4 pt-0">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 bg-secondary/30"
                      >
                        {editingId === team.id ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit()
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                            />
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={handleSaveEdit}
                              >
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="truncate font-medium">{team.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleStartEdit(team)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

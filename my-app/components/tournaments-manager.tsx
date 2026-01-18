'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trophy, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useAuth } from '@/components/auth-provider'
import { DatePicker } from '@/components/date-picker'
import type { Tournament } from '@/lib/types'

export function TournamentsManager() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    description: '',
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    description: '',
  })

  const fetchTournaments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setTournaments(data)
    }
  }

  useEffect(() => {
    if (open) {
      fetchTournaments()
    }
  }, [open])

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !user) return
    
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tournaments')
        .insert([{
          name: formData.name.trim(),
          start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
          end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
          description: formData.description.trim() || null,
          user_id: user.id,
        }])
      
      if (!error) {
        setFormData({ name: '', start_date: undefined, end_date: undefined, description: '' })
        fetchTournaments()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTournament = async (id: string) => {
    const supabase = createClient()
    await supabase.from('tournaments').delete().eq('id', id)
    fetchTournaments()
  }

  const handleStartEdit = (tournament: Tournament) => {
    setEditingId(tournament.id)
    setEditFormData({
      name: tournament.name,
      start_date: tournament.start_date ? new Date(tournament.start_date) : undefined,
      end_date: tournament.end_date ? new Date(tournament.end_date) : undefined,
      description: tournament.description || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editFormData.name.trim()) return
    
    const supabase = createClient()
    await supabase
      .from('tournaments')
      .update({
        name: editFormData.name.trim(),
        start_date: editFormData.start_date ? editFormData.start_date.toISOString().split('T')[0] : null,
        end_date: editFormData.end_date ? editFormData.end_date.toISOString().split('T')[0] : null,
        description: editFormData.description.trim() || null,
      })
      .eq('id', editingId)
    
    setEditingId(null)
    fetchTournaments()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditFormData({ name: '', start_date: undefined, end_date: undefined, description: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Trophy className="h-4 w-4" />
          Torneos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Administrar Torneos
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAddTournament} className="space-y-4 border-b pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tournament-name">Nombre del Torneo *</Label>
              <Input
                id="tournament-name"
                placeholder="Ej: Copa Primavera 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <DatePicker
                  date={formData.start_date}
                  onSelect={(date) => setFormData({ ...formData, start_date: date })}
                  placeholder="Inicio"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Fin</Label>
                <DatePicker
                  date={formData.end_date}
                  onSelect={(date) => setFormData({ ...formData, end_date: date })}
                  placeholder="Fin"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles del torneo..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={isLoading || !formData.name.trim()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Torneo
          </Button>
        </form>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Torneos guardados ({tournaments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {tournaments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No hay torneos guardados.
                  <br />
                  Agrega uno arriba.
                </div>
              ) : (
                <div className="space-y-2 p-4 pt-0">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="rounded-md border p-3 bg-secondary/30"
                    >
                      {editingId === tournament.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="h-8"
                            autoFocus
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Inicio</span>
                              <DatePicker
                                date={editFormData.start_date}
                                onSelect={(date) => setEditFormData({ ...editFormData, start_date: date })}
                                placeholder="Inicio"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Fin</span>
                              <DatePicker
                                date={editFormData.end_date}
                                onSelect={(date) => setEditFormData({ ...editFormData, end_date: date })}
                                placeholder="Fin"
                              />
                            </div>
                          </div>
                          <Textarea
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            rows={2}
                            className="text-xs"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium">{tournament.name}</h4>
                              {(tournament.start_date || tournament.end_date) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {tournament.start_date && new Date(tournament.start_date).toLocaleDateString('es-AR')}
                                  {tournament.start_date && tournament.end_date && ' - '}
                                  {tournament.end_date && new Date(tournament.end_date).toLocaleDateString('es-AR')}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleStartEdit(tournament)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTournament(tournament.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {tournament.description && (
                            <p className="text-xs text-muted-foreground">{tournament.description}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}


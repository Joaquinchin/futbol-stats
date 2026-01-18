'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Award } from 'lucide-react'

interface ResultsChartProps {
  wins: number
  draws: number
  losses: number
}

export function ResultsChart({ wins, draws, losses }: ResultsChartProps) {
  const total = wins + draws + losses

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-sm">
            Sin datos todavia
          </p>
        </CardContent>
      </Card>
    )
  }

  const data = [
    { name: 'Victorias', value: wins, color: '#39FF14' },
    { name: 'Empates', value: draws, color: '#00FFFF' },
    { name: 'Derrotas', value: losses, color: '#FF6B6B' },
  ].filter(item => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5" />
          Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a2e',
                border: '1px solid #3d3d5c',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
              itemStyle={{ color: '#e0e0e0' }}
            />
            <Legend 
              formatter={(value) => <span style={{ color: '#e0e0e0' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
          <div>
            <p className="font-bold text-lg" style={{ color: '#39FF14' }}>{wins}</p>
            <p className="text-muted-foreground">Victorias</p>
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: '#00FFFF' }}>{draws}</p>
            <p className="text-muted-foreground">Empates</p>
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: '#FF6B6B' }}>{losses}</p>
            <p className="text-muted-foreground">Derrotas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

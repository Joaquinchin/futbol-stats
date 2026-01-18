'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { MonthlyStats } from '@/lib/types'
import type { Period } from '@/components/period-filter'
import { getPeriodLabel } from '@/components/period-filter'

interface GoalsChartProps {
  data: MonthlyStats[]
  period?: Period
}

export function GoalsChart({ data, period = 'all' }: GoalsChartProps) {
  const periodLabel = getPeriodLabel(period)
  const title = period === 'all' 
    ? 'Goles y Asistencias por Mes'
    : `Goles y Asistencias - ${periodLabel}`

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-sm">
            Agrega partidos para ver tus estadisticas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            style={{ cursor: 'default' }}
          >
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#a0aec0' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#a0aec0' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a2e',
                border: '1px solid #3d3d5c',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
              labelStyle={{ color: '#e0e0e0' }}
              itemStyle={{ color: '#e0e0e0' }}
              cursor={false}
            />
            <Legend 
              wrapperStyle={{ color: '#e0e0e0' }}
              formatter={(value) => <span style={{ color: '#e0e0e0' }}>{value}</span>}
            />
            <Bar 
              dataKey="goals" 
              name="Goles"
              fill="#39FF14"
              radius={[4, 4, 0, 0]}
              activeBar={false}
            />
            <Bar 
              dataKey="assists" 
              name="Asistencias"
              fill="#00FFFF"
              radius={[4, 4, 0, 0]}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

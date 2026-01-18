'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl lg:text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className={`text-[10px] lg:text-xs truncate ${
                trend === 'up' ? 'text-primary' : 
                trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-1.5 lg:p-2 shrink-0">
            <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

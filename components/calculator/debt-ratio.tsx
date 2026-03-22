'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DebtRatioProps {
  gjeldsgrad: number
}

export function DebtRatio({ gjeldsgrad }: DebtRatioProps) {
  const getStatus = (ratio: number) => {
    if (ratio <= 400) {
      return {
        label: 'Lav gjeld',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        description: 'Du har god margin og lav risiko.'
      }
    }
    if (ratio <= 500) {
      return {
        label: 'Moderat gjeld',
        color: 'text-amber-600',
        bgColor: 'bg-amber-500',
        description: 'Vær oppmerksom på din økonomiske situasjon.'
      }
    }
    return {
      label: 'Høy gjeld',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      description: 'Du kan ha utfordringer med å betjene lånet.'
    }
  }

  const status = getStatus(gjeldsgrad)
  const progressPercent = Math.min((gjeldsgrad / 600) * 100, 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Gjeldsgrad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className={cn('text-2xl font-bold', status.color)}>
              {gjeldsgrad.toFixed(0)}%
            </span>
            <span className={cn('text-sm font-medium', status.color)}>
              {status.label}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all duration-500', status.bgColor)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>400%</span>
            <span>500%</span>
            <span>600%+</span>
          </div>

          <p className="text-sm text-muted-foreground">{status.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

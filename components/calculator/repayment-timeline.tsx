'use client'

import { formatNorwegian } from '@/lib/loan-calculations'
import type { AmortizationRow } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RepaymentTimelineProps {
  schedule: AmortizationRow[]
  totalLoan: number
}

export function RepaymentTimeline({ schedule, totalLoan }: RepaymentTimelineProps) {
  const currentYear = new Date().getFullYear()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nedbetalingsforløp</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex h-8 w-full overflow-hidden rounded-full">
            {schedule.map((row, index) => {
              const paidPercent = ((totalLoan - row.utgaendeGjeld) / totalLoan) * 100
              const remainingPercent = (row.utgaendeGjeld / totalLoan) * 100
              const segmentWidth = 100 / schedule.length
              
              return (
                <div
                  key={row.ar}
                  className="relative flex h-full"
                  style={{ width: `${segmentWidth}%` }}
                  title={`${currentYear + index}: ${formatNorwegian(row.utgaendeGjeld)} kr gjenstående`}
                >
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(row.avdrag / (row.avdrag + row.utgaendeGjeld / schedule.length)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-sky-400 transition-all duration-300"
                    style={{ width: `${100 - (row.avdrag / (row.avdrag + row.utgaendeGjeld / schedule.length)) * 100}%` }}
                  />
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentYear}</span>
            <span>{currentYear + schedule.length}</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-emerald-500" />
              <span>Avdrag betalt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-sky-400" />
              <span>Gjenstående gjeld</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { formatNorwegian } from '@/lib/loan-calculations'
import type { LoanResult } from '@/lib/loan-calculations'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  result: LoanResult
  lanebelop: number
}

export function HeroSection({ result, lanebelop }: HeroSectionProps) {
  const innenforGrense = lanebelop <= result.maksLan
  const egenkapitalOk = result.egenkapitalProsent >= 10

  return (
    <div className="rounded-xl bg-foreground p-6 text-background">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-background/70">Du kan låne maks</span>
          <span className="text-3xl font-bold tracking-tight transition-all duration-300">
            {formatNorwegian(result.maksLan)} kr
          </span>
          <div className="flex items-center gap-2 text-sm">
            {innenforGrense && egenkapitalOk ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-emerald-400">Innenfor grensen</span>
              </>
            ) : !egenkapitalOk ? (
              <>
                <XCircle className="size-4 text-red-400" />
                <span className="text-red-400">For lav egenkapital</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-red-400" />
                <span className="text-red-400">Lånebeløp overstiger maks</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-background/70">Månedskostnad</span>
          <span className="text-3xl font-bold tracking-tight transition-all duration-300">
            {formatNorwegian(result.manedskostnad)} kr
          </span>
          <div className="flex items-center gap-2 text-sm">
            {result.stresstestGodkjent ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-emerald-400">Stresstest OK</span>
              </>
            ) : (
              <>
                <AlertTriangle className="size-4 text-amber-400" />
                <span className="text-amber-400">Stresstest advarsel</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-background/10 p-3">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-background/70">Stresstest-rente:</span>
            <span>{result.stresstestRente.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-background/70">Månedskostnad ved stresstest:</span>
            <span className={cn(
              result.stresstestGodkjent ? 'text-emerald-400' : 'text-amber-400'
            )}>
              {formatNorwegian(result.stresstestManedskostnad)} kr
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

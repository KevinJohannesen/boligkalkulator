'use client'

import { useState } from 'react'
import { formatNorwegian, parseNorwegian } from '@/lib/loan-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface MonthlyBudgetProps {
  terminbelop: number
  termingebyr: number
  bruttoinntekt: number
  samboerInntekt: number
  antallSokere: 1 | 2
}

export function MonthlyBudget({ 
  terminbelop,
  termingebyr,
  bruttoinntekt, 
  samboerInntekt,
  antallSokere 
}: MonthlyBudgetProps) {
  const [felleskostnader, setFelleskostnader] = useState(3500)
  const [forsikring, setForsikring] = useState(800)

  const totalInntekt = antallSokere === 2 ? bruttoinntekt + samboerInntekt : bruttoinntekt
  const nettoInntektManed = (totalInntekt / 12) * 0.7 // Approximate after tax
  const totalTerminbelop = terminbelop + termingebyr
  const sumBoutgifter = totalTerminbelop + felleskostnader + forsikring
  const boutgifterProsent = nettoInntektManed > 0 ? (sumBoutgifter / nettoInntektManed) * 100 : 0

  const getBudgetColor = (percent: number) => {
    if (percent < 33) return 'text-emerald-600'
    if (percent < 50) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Månedlig budsjett</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Terminbeløp (lån)</span>
            <span className="font-medium">{formatNorwegian(terminbelop)} kr</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Termingebyr</span>
            <span className="font-medium">{formatNorwegian(termingebyr)} kr</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">
              Estimert strøm/felleskostnader
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={formatNorwegian(felleskostnader)}
                onChange={(e) => setFelleskostnader(parseNorwegian(e.target.value))}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                kr
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">
              Estimert forsikring
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={formatNorwegian(forsikring)}
                onChange={(e) => setForsikring(parseNorwegian(e.target.value))}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                kr
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-lg bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sum boutgifter per måned</span>
              <span className="font-semibold">{formatNorwegian(sumBoutgifter)} kr</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Andel av nettoinntekt</span>
              <span className={cn('font-medium', getBudgetColor(boutgifterProsent))}>
                {boutgifterProsent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
